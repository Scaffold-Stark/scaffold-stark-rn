import { getBlockExplorerTxLink } from "@/utils/scaffold-stark/network";
import { appToast } from "@/utils/scaffold-stark/toast";
import {
  useAccount,
  useSendTransaction,
  UseSendTransactionResult,
  useTransactionReceipt,
  UseTransactionReceiptResult,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import {
  AccountInterface,
  Call,
  ETransactionVersion,
  InvokeFunctionResponse,
} from "starknet";
import { useTargetNetwork } from "./useTargetNetwork";

type TransactionFunc = (
  tx: Call[],
  withSendTransaction?: boolean,
) => Promise<string | undefined>;

interface UseTransactorReturn {
  writeTransaction: TransactionFunc;
  transactionReceiptInstance: UseTransactionReceiptResult;
  sendTransactionInstance: UseSendTransactionResult;
}

// RN toasts are managed via toastify-react-native (ToastManager is mounted at root)

/**
 * Handles sending transactions to Starknet contracts with comprehensive UI feedback and state management.
 * This hook provides a complete transaction experience including fee estimation, notifications,
 * transaction state tracking, and block explorer integration. It supports both prepared transactions
 * (using starknet-react's sendTransaction) and direct execution with automatic fee estimation.
 *
 * @param _walletClient - Optional wallet client to use. If not provided, will use the connected account from useAccount
 * @returns {UseTransactorReturn} An object containing:
 *   - writeTransaction: (tx: Call[], withSendTransaction?: boolean) => Promise<string | undefined> - Async function that sends transactions with fee estimation, notifications, and state management
 *   - transactionReceiptInstance: UseTransactionReceiptResult - Transaction receipt data and status from useTransactionReceipt
 *   - sendTransactionInstance: UseSendTransactionResult - Send transaction state and methods from useSendTransaction
 * @see {@link https://scaffoldstark.com/docs/hooks/useTransactor}
 */
export const useTransactor = (
  _walletClient?: AccountInterface,
): UseTransactorReturn => {
  let walletClient = _walletClient;
  const { account } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  if (walletClient === undefined && account) {
    walletClient = account;
  }
  const sendTransactionInstance = useSendTransaction({});

  const [hasActiveToast, setHasActiveToast] = useState<boolean>(false);
  const [blockExplorerTxURL, setBlockExplorerTxURL] = useState<
    string | undefined
  >(undefined);
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined,
  );
  const transactionReceiptInstance = useTransactionReceipt({
    hash: transactionHash,
    enabled: !!transactionHash,
    watch: true,
  });
  const { data: txResult, status: txStatus } = transactionReceiptInstance;

  const resetStates = () => {
    setTransactionHash(undefined);
    setBlockExplorerTxURL(undefined);
  };

  useEffect(() => {
    if (hasActiveToast && txStatus && txStatus !== "pending") {
      appToast.hide();
      setHasActiveToast(false);
    }
    if (txStatus === "success") {
      appToast.showSuccess(
        "Transaction completed successfully! 🎉",
        blockExplorerTxURL,
      );
      resetStates();
    }
  }, [txResult, txStatus, blockExplorerTxURL, hasActiveToast]);

  const writeTransaction = async (
    tx: Call[],
    withSendTransaction: boolean = true,
  ): Promise<string | undefined> => {
    resetStates();
    if (!walletClient) {
      appToast.showError("Cannot access account");
      console.error("⚡️ ~ file: useTransactor.tsx ~ error");
      return;
    }

    let transactionHash:
      | Awaited<InvokeFunctionResponse>["transaction_hash"]
      | undefined = undefined;
    try {
      const networkId = await walletClient.getChainId();
      appToast.showPersistentInfo("Awaiting user confirmation", undefined, {
        position: "top",
        useModal: true,
      });
      setHasActiveToast(true);
      if (tx != null && withSendTransaction) {
        // Tx is already prepared by the caller
        const result = await sendTransactionInstance.sendAsync(tx);
        if (typeof result === "string") {
          transactionHash = result;
        } else {
          transactionHash = result.transaction_hash;
        }
      } else if (tx != null) {
        try {
          // First try to estimate fees
          const estimatedFee = await walletClient.estimateInvokeFee(
            tx as Call[],
          );

          // Use estimated fee with a safety margin (multiply by 1.5)
          const maxFee =
            (BigInt(estimatedFee.overall_fee) * BigInt(15)) / BigInt(10);

          // Set RPC 0.8 compatible parameters with estimated fees
          const txOptions = {
            version: ETransactionVersion.V3,
            maxFee: "0x" + maxFee.toString(16),
          };

          transactionHash = (await walletClient.execute(tx, txOptions))
            .transaction_hash;
        } catch (feeEstimationError) {
          console.warn(
            "Fee estimation failed, using fallback values:",
            feeEstimationError,
          );

          // Fallback to safe default values if estimation fails
          const txOptions = {
            version: ETransactionVersion.V3,
            // Use a reasonable maxFee value that won't exceed account balance
            maxFee: "0x1000000000",
            // Set resource bounds for RPC 0.8 compatibility
            resourceBounds: {
              l1_gas: {
                max_amount: 0x1000000n,
                max_price_per_unit: 0x1n,
              },
              l2_gas: {
                max_amount: 0x1000000n,
                max_price_per_unit: 0x1n,
              },
              l1_data_gas: {
                max_amount: 0x1000000n,
                max_price_per_unit: 0x1n,
              },
            },
          };

          transactionHash = (await walletClient.execute(tx, txOptions))
            .transaction_hash;
        }
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }

      setTransactionHash(transactionHash);
      if (hasActiveToast) {
        appToast.hide();
        setHasActiveToast(false);
      }

      const blockExplorerTxURL = networkId
        ? getBlockExplorerTxLink(targetNetwork.network, transactionHash)
        : "";
      setBlockExplorerTxURL(blockExplorerTxURL);
      appToast.showWaiting(
        "Waiting for transaction to complete",
        blockExplorerTxURL,
      );
      setHasActiveToast(true);
    } catch (error: any) {
      if (hasActiveToast) {
        appToast.hide();
        setHasActiveToast(false);
      }

      const errorPattern = /Contract (.*?)"}/;
      const match = errorPattern.exec(error.message);
      const message = match ? match[1] : error.message;

      console.error("⚡️ ~ file: useTransactor.tsx ~ error", message);

      appToast.showError(message);
      throw error;
    }

    return transactionHash;
  };

  return {
    writeTransaction,
    transactionReceiptInstance,
    sendTransactionInstance,
  };
};

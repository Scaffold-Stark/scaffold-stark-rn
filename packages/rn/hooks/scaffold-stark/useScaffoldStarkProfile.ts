import { useEffect, useState } from "react";
import { StarkProfile } from "starknet";
import * as chains from "@starknet-start/chains";
import scaffoldConfig from "@/scaffold.config";

type Network = "mainnet" | "sepolia" | "devnet";

const shouldUseProfile = () => {
  const supportedNetworks = new Set(["mainnet", "sepolia"]);
  const currentNetwork = scaffoldConfig.targetNetworks[0].network as Network;
  return (
    supportedNetworks.has(currentNetwork) &&
    currentNetwork !== chains.devnet.network
  );
};

const getStarknetIdApiBaseUrl = () => {
  const currentNetwork = scaffoldConfig.targetNetworks[0].network as Network;
  return currentNetwork === chains.mainnet.network
    ? "https://api.starknet.id"
    : "https://sepolia.api.starknet.id";
};

/**
 * Fetches profile data from the Starknet ID API.
 *
 * @param address - The Starknet address to fetch profile for
 * @returns Profile data with name and profilePicture
 */
export const fetchProfileFromApi = async (address: string) => {
  const starknetIdApiBaseUrl = getStarknetIdApiBaseUrl();

  try {
    const addrToDomainRes = await fetch(
      `${starknetIdApiBaseUrl}/addr_to_domain?addr=${address}`,
    );

    if (!addrToDomainRes.ok) {
      throw new Error(await addrToDomainRes.text());
    }

    const addrToDomainJson = await addrToDomainRes.json();
    const domain = addrToDomainJson.domain;

    const profileRes = await fetch(
      `${starknetIdApiBaseUrl}/domain_to_data?domain=${domain}`,
    );

    if (!profileRes.ok) throw new Error(await profileRes.text());

    const profileData = await profileRes.json();
    const id = BigInt(profileData.id).toString();

    const uriRes = await fetch(`${starknetIdApiBaseUrl}/uri?id=${id}`);
    const uriData = await uriRes.json();

    return {
      name: profileData.domain.domain,
      profilePicture: uriData.image,
    };
  } catch (e) {
    const error = e as Error;

    // Suppress known "no data" error, log all others
    if (error.message.includes("No data found")) {
      console.log(
        `[useScaffoldStarkProfile] No profile found for address: ${address}`,
      );
    } else {
      console.error("[useScaffoldStarkProfile] Error fetching profile:", error);
    }

    return {
      name: "",
      profilePicture: "",
    };
  }
};

/**
 * Fetches Starknet profile information for a given address.
 * This hook fetches profile data from the Starknet ID API and works on
 * mainnet and sepolia networks (not devnet).
 *
 * @param address - The Starknet address to fetch profile information for
 * @returns {Object} An object containing:
 *   - data: StarkProfile | undefined - The profile data with name and profilePicture
 *   - isLoading: boolean - Boolean indicating if the profile is currently loading
 * @see {@link https://scaffoldstark.com/docs/hooks/useScaffoldStarkProfile}
 */
export const useScaffoldStarkProfile = (
  address: chains.Address | undefined,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<StarkProfile | undefined>();
  const isEnabled = shouldUseProfile();

  useEffect(() => {
    if (!isEnabled || !address) {
      setProfile({ name: "", profilePicture: "" });
      return;
    }

    setIsLoading(true);

    fetchProfileFromApi(address)
      .then((data) => {
        setProfile(data);
      })
      .catch((e) => {
        console.error(`[useScaffoldStarkProfile] ${e.message}`);
        setProfile(undefined);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [address, isEnabled]);

  return { data: profile, isLoading };
};

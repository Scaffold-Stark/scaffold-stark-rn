// Custom entry point — polyfills must run before any module evaluation.
// Metro evaluates all transitively imported modules before React renders,
// so placing polyfills in _layout.tsx is too late when other routes import
// @starknet-start/react at the module level.
import "./polyfills";
import "expo-router/entry";

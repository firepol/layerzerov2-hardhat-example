const toAddressBytes32 = (address) => {
  return ethers.AbiCoder.defaultAbiCoder().encode(["address"], [address]);
}

/**
 * Get the contract factory from an external npm package (which artifacts are located in `node_modules`)
 * @param npmPackage npm package name, e.g. `@uniswap/v3-core`
 * @param contractName contract name, e.g. `UniswapV3Pool`
 * @param subPath path under `contracts`, e.g. `interfaces/base/`
 * @param options other options, e.g. the object needed to link a library
 */
const getExternalFactory = async (npmPackage, contractName, subPath = "", options) => {
  if (subPath != "" && !subPath.endsWith("/")) subPath += "/";
  const artifact = require(`${npmPackage}/artifacts/contracts/${subPath}${contractName}.sol/${contractName}.json`);
  if (options) {
    return ethers.getContractFactoryFromArtifact(artifact, options);
  }
  return ethers.getContractFactory(artifact.abi, artifact.bytecode);
}

module.exports = {
  toAddressBytes32,
  getExternalFactory,
}
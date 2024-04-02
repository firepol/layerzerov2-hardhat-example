const { expect } = require("chai");
const { toAddressBytes32, getExternalFactory } = require("./utils");
const { solidityPacked } = require("ethers");
const { Options } = require("@layerzerolabs/lz-v2-utilities");

describe("LayerZeroV2 OFT", function() {
  let coinA, coinB, endpointA, endpointB;
  let supply = ethers.parseUnits("100000");
  let deployer;

  describe("LayerZeroV2 tests", function() {

    it("Should deploy and configure peers", async function() {
      const signers = await ethers.getSigners();
      deployer = signers[0];

      // Deploy mock endpoints
      const Endpoint = await getExternalFactory("@layerzerolabs/lz-evm-protocol-v2", "EndpointV2");
      endpointA = await Endpoint.deploy(0, deployer);
      endpointB = await Endpoint.deploy(1, deployer);

      // Deploy coins
      const OftCoin = await ethers.getContractFactory("OftCoin");
      coinA = await OftCoin.deploy("Coin A", "A", endpointA.target, deployer, supply); // coin on chain 0
      coinB = await OftCoin.deploy("Coin B", "B", endpointB.target, deployer, 0); // coin on chain 1

      // Set peers
      await coinA.setPeer(1, toAddressBytes32(coinB.target));
      await coinB.setPeer(0, toAddressBytes32(coinA.target));
    });

    it("Should get a quote and send", async function() {    
      // https://docs.layerzero.network/v2/developers/evm/gas-settings/options#option-types
      // The most common options you will use when building are lzReceiveOption, lzComposeOption, and lzNativeDropOption.
      const _options = Options.newOptions();
      const GAS_LIMIT = 1_000_000; // Gas limit for the executor // 50k should be enough
      const MSG_VALUE = 0; // msg.value for the lzReceive() function on destination in wei
      _options.addExecutorLzReceiveOption(GAS_LIMIT, MSG_VALUE);
      _options.addExecutorComposeOption(0, 30000, 0);

      // struct SendParam {
      //   uint32 dstEid; // Destination endpoint ID.
      //   bytes32 to; // Recipient address.
      //   uint256 amountLD; // Amount to send in local decimals.
      //   uint256 minAmountLD; // Minimum amount to send in local decimals.
      //   bytes extraOptions; // Additional options supplied by the caller to be used in the LayerZero message.
      //   bytes composeMsg; // The composed message for the send() operation.
      //   bytes oftCmd; // The OFT command to be executed, unused in default OFT implementations.
      // }

      let sendParams = {
        dstEid: 1,
        to: toAddressBytes32(deployer.address),
        amountLD: ethers.parseUnits("100"),
        minAmountLD: "0",
        extraOptions: _options.toHex(),
        composeMsg: "0x",
        oftCmd: "0x",
      }

      let quote = await coinA.quoteSend(sendParams, false);
      // TODO: quote fails with the following error (to fix):
      // Error: VM Exception while processing transaction: reverted with an unrecognized custom error (return data: 0x6c1ccdb5)
    });

  });

});
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/OmikujiNFT.sol";

contract DeployOmikuji is Script {
    function run() external {
        // プライベートキーの取得
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // JPYCのコントラクトアドレス
        address jpycAddress;

        // チェーンIDに基づいてJPYCアドレスを設定
        if (block.chainid == 1) {
            // Ethereum Mainnet
            jpycAddress = 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB;
        } else if (block.chainid == 137) {
            // Polygon Mainnet
            jpycAddress = 0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB;
        } else if (block.chainid == 80002) {
            // Polygon Amoy Testnet
            jpycAddress = 0x4BcFb3C8687EAe61deCA1d6fD5d24E141Bb8DFf0;
        } else {
            revert("Unsupported network");
        }

        vm.startBroadcast(deployerPrivateKey);

        // おみくじコントラクトのデプロイ
        OmikujiNFT omikuji = new OmikujiNFT(jpycAddress);

        // 運勢の画像URIを設定
        string[] memory fortunes = new string[](5);
        fortunes[0] = unicode"大吉";
        fortunes[1] = unicode"中吉";
        fortunes[2] = unicode"小吉";
        fortunes[3] = unicode"凶";
        fortunes[4] = unicode"末吉";

        string[] memory imageUris = new string[](5);
        imageUris[
            0
        ] = "https://arweave.net/NRloglGyUQfRAN4IEnvdXUQqokAn3qKOEZQTCv3xUGk";
        imageUris[
            1
        ] = "https://arweave.net/aMckaIPIYFJgl9Vdv_wpdYB6EXCQYsmjjoFcvCLDJ8k";
        imageUris[
            2
        ] = "https://arweave.net/eeLZv8eaFqovZ2rwCD9P673ap-BeoROVT-tlN9_ptd8";
        imageUris[
            3
        ] = "https://arweave.net/8_8_wgSVMQiwzrK3JD1IHTJmbOwo4cl9yK85XRlPJEQ"; // 吉の画像URIを設定してください
        imageUris[
            4
        ] = "https://arweave.net/pjKFk6dNt5BC-rckA8o8tdoMIUMYZtiAdEAw3SUsPe4";

        omikuji.setBatchFortuneImages(fortunes, imageUris);

        console.log("Available fortunes:");
        string[] memory availableFortunes = omikuji.getAvailableFortunes();
        for (uint i = 0; i < availableFortunes.length; i++) {
            console.log(availableFortunes[i]);
            console.log(
                "Image URI:",
                omikuji.getFortuneImageUri(availableFortunes[i])
            );
        }

        // 確率設定を確認
        uint256[] memory probs = omikuji.getFortuneProbabilities();
        console.log("Fortune probabilities:");
        for (uint i = 0; i < probs.length; i++) {
            console.log(availableFortunes[i], ":", probs[i], "%");
        }

        vm.stopBroadcast();

        console.log("Omikuji contract deployed to:", address(omikuji));
        console.log("Network:", block.chainid);
        console.log("JPYC address:", jpycAddress);
    }
}

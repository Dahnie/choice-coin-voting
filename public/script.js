"use strict"
let choiceCoinAmount = "";
let issueNumber = "";
let voteAnswer = "";
const one_address = "3ZAXDUCY2NQK5GI6TZIE7SOZIKHNCNV66H5HXJUMF35XIWXDO4MCDIM3ZA"
const zero_address = "PICMDB6LRHMTYMNDO6CKWTQSMA3RDPUUQQKSCTTFODRHUBFCAEMBO32OPA"
let choiceReceivingStatus = "zero";
let walletVerificationStatus = false;
const choiceCoinInput = document.querySelector("#choice-coin");
const issueNumberInput = document.querySelector("#issue-number");
const connectWalletBtn = document.querySelector("#connect-wallet-btn");
const voteTopic = document.querySelector("#connect-wallet-btn");
const voteYes = document.querySelector("#yes");
const voteNo = document.querySelector("#no");
const submitVoteBtn = document.querySelector("#submit-vote");
let voteOptions = document.getElementsByName("vote-output")
let transactionID = "";
let voterAddress = "";



// Function that gets Choice Coin Number and assign
const getChoiceCoinValue = function (input) {
    input.addEventListener("change", (e) => {
        choiceCoinAmount = Number(e.target.value);
        console.log("Choice Value", choiceCoinAmount);
    })
}

//Function that gets Issue Number and assign
const getIssueNumber = function (input) {
    input.addEventListener("change", (e) => {
        issueNumber = e.target.value;
        console.log("Issue Number", issueNumber);
    })
}
getChoiceCoinValue(choiceCoinInput)
getIssueNumber(issueNumberInput)

// Function that verifies the Wallet
const verifyWalletConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    //Connect account for algosigner...if installed.
    await AlgoSigner.connect()
        .then((d) => { })
        .catch((e) => console.log("error in connection"));

    if (choiceCoinAmount !== "" && issueNumber !== "") {
        // Checks if algosigner extension is installed or not.
        if (!AlgoSigner) {
            return alert("Please install Algosigner Extension on your browser");
        } else {
            //if installed, verify wallet and connect. 
            alert("wallet verified")
            walletVerificationStatus = true;
            // alert(walletVerificationStatus)
        }

        // TODO May add disabled funtionality
        // connectWalletBtn.disabled = true;
    } else {
        alert("Invalid entry...Wallet did not verify")
        walletVerificationStatus = false;
        // alert(walletVerificationStatus)
    }
}
connectWalletBtn.addEventListener("click", verifyWalletConnection)


//  A function that determines whether X Choice is sent from voter's wallet to zero_address or one_address.
const receiverAddressCheck = function () {
    if (choiceReceivingStatus === "zero") {
        alert("Choice will be sent to the zero_address")
    } else {
        alert("Choice will be sent to the one_address")
    }
}

const performTransaction = async (receiverAddress, senderAddress, choiceAmount) => {
    const algodServer = 'https://testnet-algorand.api.purestake.io/ps2'
    const indexerServer = 'https://testnet-algorand.api.purestake.io/idx2'
    const token = { 'X-API-Key': 'VJRibufrXh3v8waXXLeve3EsekIZnr7u9B9V0eMs' }
    const port = '5500';
    let accounts;
    let txParamsJS;
    let signedTxs;
    let tx;
    let algodClient = new algosdk.Algodv2(token, algodServer, port);
    let indexerClient = new algosdk.Indexer(token, indexerServer, port);

    algodClient.healthCheck().do()
        .then(d => {
            return d
        })
        .catch(e => {
            console.error(e);
        });

    // Generate accounts from TestNet app
    AlgoSigner.accounts({
        ledger: 'TestNet'
    })
        .then((data) => {
            accounts = data;
            voterAddress = accounts[2]["address"]
            console.log("accounts-------", accounts);
        })
        .catch((e) => {
            console.error(e);
        });

    // Generate transaction paramenters
    algodClient.getTransactionParams().do()
        .then((data) => {
            txParamsJS = data;
            console.log("txParamsJS............", txParamsJS);
            // alert(txParamsJS)
        })
        .catch((err) => {
            console.error(err);
        });
    AlgoSigner.algod({
        ledger: "TestNet",
        path: "/v2/transactions/params"
    })
        .then((data) => {
            txParamsJS = data;
            console.log("txParams-------------", txParamsJS);
            alert(txParamsJS)

            // Agosdk method that executes payment to addresses.              
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                // TODO Final todo is to generate senderAddress from the API response from the account-generating stuff, not manually inputing it.
                from: senderAddress,
                to: receiverAddress,
                amount: +choiceAmount * 1_000_000,
                suggestedParams:
                {
                    "flatFee": false,
                    "fee": 0,
                    "firstRound": (Number(txParamsJS["last-round"])),
                    "lastRound": Number(txParamsJS["last-round"]) + 1000,
                    // 18684498--18685498
                    "genesisID": "testnet-v1.0",
                    "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
                }
            });




            // Use the AlgoSigner encoding library to make the transactions base64
            let txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());

            // Sign the transaction and send the coin appropriately and also display the Transaction ID.
            AlgoSigner.signTxn([{ txn: txn_b64 }])
                .then((data) => {
                    signedTxs = data;
                    console.log("Signed Txn----", signedTxs);
                    transactionID = signedTxs[0].txID
                    AlgoSigner.send({
                        ledger: 'TestNet',
                        tx: signedTxs[0].blob
                    })
                        .then((data) => {
                            tx = data;
                            alert(`transaction complete with transaction id: ${transactionID}`)
                        })
                        .catch((err) => {
                            console.error(err.message);
                            alert(`Transaction with ID ${transactionID} encountered error: ${err.message}`,)

                        });
                })
                .catch((err) => {
                    console.error(err.message);
                });
        })
        .catch((err) => {
            console.log(err.message);
        })

}



// Final Vote Submit
submitVoteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Checks if wallet is verified, vote should be assigned, submitted and choice should be sent to appropriate address
    if (walletVerificationStatus) {
        for (let i = 0; i < voteOptions.length; i++) {
            if (voteOptions[i].checked) {
                voteAnswer = voteOptions[i].value
            }
        }
        alert("vote submitted")
        console.log("vote", voteAnswer);
        // An if statement that sends the choice coin to the specific address on submit based on the vote response
        if (voteAnswer === "yes") {
            // Send Choice amount to zero_address
            performTransaction(zero_address, issueNumber, choiceCoinAmount)
            choiceReceivingStatus = "zero";
        } else {
            // Answer is no
            // Send Choice amount to one_address
            choiceReceivingStatus = "one";
            performTransaction(one_address, issueNumber, choiceCoinAmount)
        }
        receiverAddressCheck();
    } else {
        alert("vote can't be submitted")
    }

})



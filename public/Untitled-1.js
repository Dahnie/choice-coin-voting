// Function algosdk
const performTransaction = async (receiverAddress, senderAddress, choiceAmount) => {

    // // Create an Algod client to get suggested transaction params
    // let client = new algosdk.Algodv2(token, server, port, headers);
    // let suggestedParams = await client.getTransactionParams().do();

    // Use the JS SDK to build a Transaction
    // let sdkTx = new algosdk.Transaction({
    //     to: receiverAddress,
    //     from: senderAddress,
    //     amount: choiceAmount,
    //     // ...suggestedParams,
    // });

    // // Get the binary and base64 encode it
    // let binaryTx = sdkTx.toByte();
    // let base64Tx = AlgoSigner.encoding.msgpackToBase64(binaryTx);

    // let signedTxs = await AlgoSigner.signTxn([
    //     {
    //         txn: base64Tx,
    //     },
    // ]);

    const txn = await AlgoSigner.algod({
        ledger: "TestNet",
        path: "/v2/transactions/params",
    })
        .then((data) => {
            console.log("txn data", data);
            return data;
        })
        .catch((e) => console.log("error in algod"));

    //retrieve account details
    const account = await AlgoSigner.accounts({
        ledger: "TestNet",
    })
        .then((value) => value[0])
        .then((result) => {
            const { address } = result;

            return address;
        })

        .catch((e) => console.log("cannot retrieve accounts"));

    console.log("txxxn", txn);

    // const client = new algosdk.Algod(token, server, port);
    // let suggestedParams = await client.getTransactionParams().do();

    // Use the JS SDK to build a Transaction
    // let sdkTx = new algosdk.Transaction({
    //     to: receiverAddress,
    //     from: senderAddress,
    //     amount: choiceAmount,
    //     // ...suggestedParams,
    //     ...txn
    // });
    // console.log(sdkTx);

    // Get the binary and base64 encode it
    // let binaryTx = sdkTx.toByte();
    // let base64Tx = AlgoSigner.encoding.msgpackToBase64(binaryTx);

    // let signed = await AlgoSigner.signTxn([
    //     {
    //         txn: base64Tx,
    //     },
    // ])
    //     .then((data) => console.log("dataaa", data))
    //     .catch((err) => console.log(err.message))


    // Transaction signature
    await AlgoSigner.sign({
        "from": senderAddress,
        "to": receiverAddress,
        "amount": +choiceAmount,
        "note": "voting",
        "type": "pay",
        "fee": txn["min-fee"],
        "firstRound": txn['last-round'],
        "lastRound": txn['last-round'] + 1000,
        "genesisID": txn['genesis-is'],
        "genesisHash": txn['genesis-hash'],

    })
        .then((data) => console.log("complete", data))
        .catch((err) => console.log("errorrrr", err.message));
}

const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);

const makeCallUnit = function(
    contractAddress, 
    functionName, 
    argumentTypes, 
    argumentValues, 
    callValue
) {
    return {
        contractAddress: contractAddress,
        functionSelector: encodedFunction(functionSignature(functionName, argumentTypes)),
        functionArguments: encodedParams(argumentTypes, argumentValues),
        value: callValue,
    }
}

const functionSignature = function(functionName, argumentTypes) {
    return String(`${functionName}(${argumentTypes.join(',')})`);
}

const encodedFunction = function(functionSignature) {
    return web3.eth.abi.encodeFunctionSignature(functionSignature);
}

const encodedParams = function(argumentTypes, argumentValues) {
    return web3.eth.abi.encodeParameters(
        argumentTypes, 
        argumentValues
    );
}

module.exports = {
    makeCallUnit, functionSignature, encodedFunction, encodedParams,
}
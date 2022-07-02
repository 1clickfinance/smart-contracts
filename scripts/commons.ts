import "dotenv/config"
import Web3 from "web3"

const web3 = new Web3(Web3.givenProvider)

export interface CallUnit {
    contractAddress: string;
    functionSelector: string;
    functionArguments: string;
    value: number;
}

export const makeCallUnit = (
    contractAddress: string, 
    functionName: string, 
    argumentTypes: string[],
    argumentValues: any[], 
    callValue: number,
): CallUnit =>  {
    return {
        contractAddress: contractAddress,
        functionSelector: encodedFunction(functionSignature(functionName, argumentTypes)),
        functionArguments: encodedParams(argumentTypes, argumentValues),
        value: callValue,
    }
}

export const functionSignature = (
    functionName: string, 
    argumentTypes: string[],
): string => {
    return String(`${functionName}(${argumentTypes.join(',')})`);
}

export const encodedFunction = (functionSignature: string): string => {
    return web3.eth.abi.encodeFunctionSignature(functionSignature);
}

export const encodedParams = (
    argumentTypes: string[],
    argumentValues: any[],
): string => {
    return web3.eth.abi.encodeParameters(
        argumentTypes, 
        argumentValues
    );
}

export const getEnvVariable = (key: string): string => {
    const value = process.env[key]
    if (value !== undefined) {
        return value
    } else {
        throw new Error(`${key} not set in environment variables`)
    }
}

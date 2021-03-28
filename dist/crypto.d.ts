/// <reference types="node" />
import * as crypto from "crypto";
export declare function verifySignature(publicKey: crypto.KeyLike | crypto.VerifyKeyObjectInput | crypto.VerifyPublicKeyInput, signature: string, requestBody: string, webhookUri: string): boolean;

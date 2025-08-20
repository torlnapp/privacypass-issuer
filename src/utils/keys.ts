import { Issuer } from "@cloudflare/privacypass-ts/lib/src/pub_verif_token";
import { MODE } from "../lib/mode";

export async function getKeys() {
	const keys = await Issuer.generateKey(MODE, {
		modulusLength: 2048,
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
	});

	return keys;
}

// async function isKeyExists() {
// 	return (
// 		(await Bun.file(path.resolve(__dirname, "public_key")).exists()) &&
// 		(await Bun.file(path.resolve(__dirname, "private_key")).exists())
// 	);
// }

// async function saveKey(publicKey: CryptoKey, privateKey: CryptoKey) {
// 	Bun.write(
// 		path.resolve(__dirname, "public_key"),
// 		await crypto.subtle.exportKey("spki", publicKey),
// 	);
// 	Bun.write(
// 		path.resolve(__dirname, "private_key"),
// 		await crypto.subtle.exportKey("pkcs8", privateKey),
// 	);
// }

// async function loadKey() {
// 	const publicKey = await crypto.subtle.importKey(
// 		"spki",
// 		await Bun.file(path.resolve(__dirname, "public_key")).arrayBuffer(),
// 		{ name: "RSA-PSS", hash: "SHA-256" },
// 		true,
// 		["verify"],
// 	);
// 	const privateKey = await crypto.subtle.importKey(
// 		"pkcs8",
// 		await Bun.file(path.resolve(__dirname, "private_key")).arrayBuffer(),
// 		{ name: "RSA-PSS", hash: "SHA-256" },
// 		true,
// 		["sign"],
// 	);

// 	return { publicKey, privateKey };
// }

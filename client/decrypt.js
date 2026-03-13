async function decryptFile() {

 const link = document.getElementById("secureLink").value.trim();

 if (!link) {
  alert("Paste secure link");
  return;
 }

 const hashIndex = link.indexOf("#");

 if (hashIndex === -1) {
  alert("Invalid link");
  return;
 }

 const downloadURL = link.substring(0, hashIndex);

 const fragment = link.substring(hashIndex + 1);

 const params = new URLSearchParams(fragment);

 const keyString = params.get("key");

 const fileName = decodeURIComponent(params.get("name") || "file");

 const fileType = decodeURIComponent(params.get("type") || "application/octet-stream");

 const keyBytes = new Uint8Array(keyString.split(",").map(Number));

 const key = await crypto.subtle.importKey(
  "raw",
  keyBytes,
  { name: "AES-GCM" },
  false,
  ["decrypt"]
 );

 const response = await fetch(downloadURL);

 const encryptedBuffer = await response.arrayBuffer();

 const encryptedData = new Uint8Array(encryptedBuffer);

 const iv = encryptedData.slice(0, 12);

 const data = encryptedData.slice(12);

 const decrypted = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv: iv },
  key,
  data
 );

 const blob = new Blob([decrypted], { type: fileType });

 const url = URL.createObjectURL(blob);

 const a = document.createElement("a");

 a.href = url;

 a.download = fileName;

 document.body.appendChild(a);

 a.click();

 document.body.removeChild(a);

}
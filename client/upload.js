async function uploadFile() {

 const fileInput = document.getElementById("fileInput");
 const file = fileInput.files[0];

 if (!file) {
  alert("Please select a file");
  return;
 }

 // Generate AES key
 const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
 );

 // Export key
 const exportedKey = await crypto.subtle.exportKey("raw", key);

 const keyArray = Array.from(new Uint8Array(exportedKey));

 const keyString = keyArray.join(",");

 // Generate IV
 const iv = crypto.getRandomValues(new Uint8Array(12));

 const buffer = await file.arrayBuffer();

 const encrypted = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv: iv },
  key,
  buffer
 );

 // Combine IV + encrypted data
 const combined = new Uint8Array(iv.length + encrypted.byteLength);

 combined.set(iv);
 combined.set(new Uint8Array(encrypted), iv.length);

 const blob = new Blob([combined]);

 const formData = new FormData();

 formData.append("file", blob, file.name + ".enc");

 const response = await fetch("http://localhost:3000/api/upload", {
  method: "POST",
  body: formData
 });

 const result = await response.json();

 const link =
  result.link +
  "#key=" +
  keyString +
  "&name=" +
  encodeURIComponent(file.name) +
  "&type=" +
  encodeURIComponent(file.type);

 document.getElementById("link").innerText = link;

}
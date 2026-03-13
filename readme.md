# Secure PDF Sharing System using Public-Key Cryptography

This project implements a **secure PDF file sharing system** using **Public-Key Cryptography** in Node.js.  
The system allows users to securely exchange PDF documents using a combination of **RSA (asymmetric encryption)** and **AES (symmetric encryption)**.

Currently, the system supports **two users (userA and userB)** with pre-generated keys to demonstrate secure communication.

---

# How the System Works

The system uses **Hybrid Encryption**, which combines RSA and AES to securely share files.

---

## Encryption Process

1. A user uploads a **PDF file** and selects a **recipient**.
2. The system generates a **random AES-256 encryption key** and an **initialization vector (IV)**.
3. The **PDF file is encrypted using AES-256**, which is efficient for large files.
4. The **AES key is encrypted using the recipient's RSA public key**.
5. The encrypted data is packaged into an **encrypted envelope (.enc file)** containing:
   - Encrypted PDF
   - Encrypted AES key
   - Initialization Vector (IV)
   - Original file name

The `.enc` file is then downloaded and sent to the recipient.

---

## Decryption Process

1. The recipient uploads the **encrypted .enc file**.
2. The system loads the **recipient’s RSA private key**.
3. The **AES key is decrypted using the private key**.
4. The decrypted AES key is used to **decrypt the PDF file**.
5. The system returns the **original PDF document** for download.

---

# Security Approach

This project uses **Hybrid Encryption**, which combines two cryptographic techniques:

### RSA (Public-Key Encryption)
- Used to encrypt the **AES encryption key**.
- Only the recipient with the correct **private key** can decrypt it.

### AES-256 (Symmetric Encryption)
- Used to encrypt the **PDF file itself**.
- Efficient and fast for encrypting large files.

This method is widely used in secure systems such as **HTTPS, secure messaging apps, and encrypted file sharing platforms**.

---

# Technologies Used

- **Node.js**
- **Express.js**
- **Node.js Crypto Module**
- **Multer (for file upload handling)**

---

# Future Improvements

- Support for **multiple users**
- **Dynamic key generation**
- **Secure key distribution**
- **Database integration**
- **User authentication**
- Web interface for easier file sharing

---

# Project Goal

The goal of this project is to demonstrate the **core concept of secure communication using public-key cryptography**, where data can be safely transmitted and accessed only by the intended recipient.

## How to Run the Project

1. Clone the repository.

2. > npm install express multer nodemon

3. > npm install
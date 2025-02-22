# MyGit - A Custom Git-Like Version Control System

MyGit is a lightweight, custom version control system built using **Node.js**. It tracks file changes using **Merkle Trees**, ensuring efficient comparison of file states across commits.

## 🚀 Features

- **Initialize a Repository**: Create a `.mygit/` directory with necessary metadata.
- **Track File Changes**: Add files to the index and detect modifications.
- **Commit Changes**: Store file states and maintain a version history.
- **Efficient Change Detection**: Uses **Merkle Trees** to compare commits quickly.
- **Checkout Commits**: Restore previous file versions.
- **Compare Commits**: Determine whether changes exist between commits.
- **Show Status**: List modified, new, and deleted files.

---

## 📌 Installation

```sh
# Clone this repository
git clone https://github.com/yourusername/mygit.git
cd mygit

# Install dependencies
npm install
```

---

## 📖 Usage

### 1️⃣ Initialize MyGit Repository

```sh
node mygit.js init
```

This creates the `.mygit/` directory with necessary folders and files.

### 2️⃣ Add Files to Staging Area

```sh
node mygit.js add path/to/file.txt
```

This stores a hashed version of the file in `.mygit/objects/`.

### 3️⃣ Check Status

```sh
node mygit.js status
```

Outputs:

```
🔍 Status:
🆕 New: ["file.txt"]
✅ No changes detected!
```

### 4️⃣ Commit Changes

```sh
node mygit.js commit "Initial commit"
```

Outputs:

```
Committed as d1a2b3c4 (Merkle Root: a1b2c3d4e5)
```

### 5️⃣ Compare Commits

```sh
node mygit.js compareCommits <commit1_hash> <commit2_hash>
```

Outputs:

```
Comparing d1a2b3c4 ↔ e5f6g7h8
❌ Changes detected! (Merkle roots differ)
```

### 6️⃣ Checkout a Commit

```sh
node mygit.js checkout <commit_hash>
```

This restores files from a previous commit.

---

## ⚡ How MyGit Works

1. **Adding Files**:

   - Hashes the file content and stores it in `.mygit/objects/`.
   - Updates the `.mygit/index` file to track the latest version.

2. **Committing Changes**:

   - Builds a **Merkle Tree** using file hashes.
   - Saves commit metadata in `.mygit/commits/`.
   - Updates `.mygit/branches/main.json` with the latest commit.

3. **Comparing Commits**:

   - Retrieves Merkle roots of both commits.
   - If the roots match, no changes are detected.
   - If they differ, specific files are identified as changed.

4. **Checking Out a Commit**:
   - Reads commit data and restores the files.

---

## 🛠 Technologies Used

- **Node.js** - Core runtime
- **File System (fs)** - Handling file operations
- **Crypto** - Hashing file contents for integrity
- **Merkle Trees** - Efficient change tracking

---

## 🎯 Future Enhancements

- ✅ Implement branching
- ✅ Support remote repositories
- ✅ Improve CLI interface with better UX

---

## 📝 License

This project is licensed under the **MIT License**.

---

👨‍💻 **Developed by Your Name**

📌 _Version Control Simplified!_

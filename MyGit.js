const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

export class MyGit {
    constructor() {
        this.GIT_DIR = ".mygit/";
        this.OBJECTS_DIR = path.join(this.GIT_DIR, "objects/");
        this.COMMITS_DIR = path.join(this.GIT_DIR, "commits/");
        this.BRANCHES_DIR = path.join(this.GIT_DIR, "branches/");
        this.INDEX_FILE = path.join(this.GIT_DIR, "index");
        this.HEAD_FILE = path.join(this.GIT_DIR, "HEAD");

        if (!fs.existsSync(this.GIT_DIR)) this.init();
    }

    init() {
        fs.mkdirSync(this.GIT_DIR);
        fs.mkdirSync(this.BRANCHES_DIR);
        fs.mkdirSync(this.COMMITS_DIR);
        fs.mkdirSync(this.OBJECTS_DIR);

        fs.writeFileSync(this.HEAD_FILE, "main");
        fs.writeFileSync(path.join(this.BRANCHES_DIR, "main.json"), JSON.stringify({ latest: null }));
        fs.writeFileSync(this.INDEX_FILE, JSON.stringify({}));

        console.log("Initialized empty MyGit repository in .mygit/");
    }

    hashFile(content) {
        return crypto.createHash("sha256").update(content).digest("hex");
    }

    add(filePath) {
        const content = fs.readFileSync(filePath, "utf-8");
        const hash = this.hashFile(content);

        fs.writeFileSync(path.join(this.OBJECTS_DIR, hash), content);

        const index = JSON.parse(fs.readFileSync(this.INDEX_FILE, "utf-8"));
        index[filePath] = hash;
        fs.writeFileSync(this.INDEX_FILE, JSON.stringify(index, null, 2));

        console.log(`Added ${filePath} (hash: ${hash})`);
    }

    commit(message) {
        const branch = fs.readFileSync(this.HEAD_FILE, "utf-8").trim();
        const branchPath = path.join(this.BRANCHES_DIR, `${branch}.json`);
        const latestCommit = JSON.parse(fs.readFileSync(branchPath, "utf-8")).latest;
        const commitHash = crypto.randomBytes(10).toString("hex");

        const index = JSON.parse(fs.readFileSync(this.INDEX_FILE, "utf-8"));
        const files = Object.entries(index).map(([filePath, hash]) => ({ filePath, hash }));

        // Create Merkle Tree for the commit
        const merkleTree = new MerkleTree(files.map(f => f.hash));
        const merkleRoot = merkleTree.root;

        const commitData = {
            parent: latestCommit,
            message: message,
            timestamp: Date.now(),
            files: files,
            merkleRoot: merkleRoot
        };

        fs.writeFileSync(path.join(this.COMMITS_DIR, `${commitHash}.json`), JSON.stringify(commitData, null, 2));
        fs.writeFileSync(branchPath, JSON.stringify({ latest: commitHash }));

        console.log(`Committed as ${commitHash} (Merkle Root: ${merkleRoot})`);
    }

    checkout(commitHash) {
        const commitPath = path.join(this.COMMITS_DIR, `${commitHash}.json`);
        if (!fs.existsSync(commitPath)) {
            console.log(`Commit ${commitHash} not found.`);
            return;
        }

        const commitData = JSON.parse(fs.readFileSync(commitPath, "utf-8"));
        commitData.files.forEach(({ filePath, hash }) => {
            const objectPath = path.join(this.OBJECTS_DIR, hash);
            if (fs.existsSync(objectPath)) {
                fs.writeFileSync(filePath, fs.readFileSync(objectPath, "utf-8"));
                console.log(`Restored: ${filePath}`);
            } else {
                console.log(`Error: Missing object for ${filePath}`);
            }
        });

        fs.writeFileSync(this.HEAD_FILE, commitHash);
        console.log(`Checked out commit ${commitHash}`);
    }

    compareCommits(commit1, commit2) {
        const commit1Path = path.join(this.COMMITS_DIR, `${commit1}.json`);
        const commit2Path = path.join(this.COMMITS_DIR, `${commit2}.json`);

        if (!fs.existsSync(commit1Path) || !fs.existsSync(commit2Path)) {
            console.log("One or both commits not found.");
            return;
        }

        const commit1Data = JSON.parse(fs.readFileSync(commit1Path, "utf-8"));
        const commit2Data = JSON.parse(fs.readFileSync(commit2Path, "utf-8"));

        console.log(`Comparing ${commit1} ↔ ${commit2}`);
        if (commit1Data.merkleRoot === commit2Data.merkleRoot) {
            console.log("✅ No changes (Merkle roots match).");
        } else {
            console.log("❌ Changes detected! (Merkle roots differ)");
        }
    }

    getTrackedFiles() {
        if (!fs.existsSync(this.INDEX_FILE)) return {};
        return JSON.parse(fs.readFileSync(this.INDEX_FILE, "utf-8"));
    }
    
    getLastCommitFiles() {
        const branch = fs.readFileSync(this.HEAD_FILE, "utf-8").trim();
        const branchPath = path.join(this.BRANCHES_DIR, `${branch}.json`);
    
        if (!fs.existsSync(branchPath)) return {};
    
        const latestCommit = JSON.parse(fs.readFileSync(branchPath, "utf-8")).latest;
        if (!latestCommit) return {};
    
        const commitPath = path.join(this.COMMITS_DIR, `${latestCommit}.json`);
        if (!fs.existsSync(commitPath)) return {};
    
        const data = JSON.parse(fs.readFileSync(commitPath, "utf-8")).files || {};
        if(Array.isArray(data) && data.length > 0){
            const previousCommitData = {};
            for(let i=0;i<data.length;i++){
                previousCommitData[data[i].filePath] = data[i].hash;
            }
            return previousCommitData;
        }
        return data;
    }
    
    status() {
        const lastCommitFiles = this.getLastCommitFiles();
        if (!fs.existsSync(this.INDEX_FILE)) return {};
        const workingDirFiles = Object.keys(JSON.parse(fs.readFileSync(this.INDEX_FILE, "utf-8"))); // Get current files
    
        let modified = [];
        let newFiles = [];
        let deleted = [];
        console.log(lastCommitFiles, workingDirFiles);
        workingDirFiles.forEach((file) => {
          if (file === ".mygit") return; // Skip git metadata
    
          const content = fs.readFileSync(file, "utf-8");
          const hash = this.hashFile(content);
    
          if (lastCommitFiles[file] && lastCommitFiles[file] !== hash) {
            modified.push(file);
          } else if (!lastCommitFiles[file]) {
            newFiles.push(file);
          }
        });
    
        Object.keys(lastCommitFiles).forEach(file => {
          if (!workingDirFiles.includes(file)) {
            deleted.push(file);
          }
        });
    
        console.log("🔍 Status:");
        if (modified.length) console.log("📝 Modified:", modified);
        if (newFiles.length) console.log("🆕 New:", newFiles);
        if (deleted.length) console.log("❌ Deleted:", deleted);
        if (!modified.length && !newFiles.length && !deleted.length) console.log("✅ No changes detected!");
    }
}
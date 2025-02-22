const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

export class MerkleTree {
    constructor(data) {
        this.leaves = data.map(d => this.hash(d));
        this.levels = this.buildTree(this.leaves);
    }

    hash(data) {
        return crypto.createHash("sha256").update(data).digest("hex");
    }

    buildTree(leaves) {
        let levels = [leaves];
        let currentLevel = leaves;

        while (currentLevel.length > 1) {
            const nextLevel = [];

            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                nextLevel.push(this.hash(left + right));
            }

            levels.push(nextLevel);
            currentLevel = nextLevel;
        }

        return levels;
    }

    get root() {
        return this.levels[this.levels.length - 1][0];
    }

    getProof(data) {
        let hash = this.hash(data);
        let index = this.leaves.indexOf(hash);
        if (index === -1) return null;

        let proof = [];
        for (let i = 0; i < this.levels.length - 1; i++) {
            let isRightNode = index % 2 !== 0;
            let pairIndex = isRightNode ? index - 1 : index + 1;
            if (pairIndex < this.levels[i].length) {
                proof.push(this.levels[i][pairIndex]);
            }

            index = Math.floor(index / 2);
        }

        return proof;
    }

    verifyProof(data, proof, root) {
        let hash = this.hash(data);
        proof.forEach(sibling => {
            hash = this.hash(hash + sibling);
        });

        return hash === root;
    }
}
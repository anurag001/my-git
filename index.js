const fs = require("fs");
const path = require("path");
const MyGit = require("./MyGit");

// 🛠 Testing
const git = new MyGit();
git.add("./sample/file1.txt");
git.add("./sample/file2.txt");
git.status();
git.commit("First commit");
git.status();

git.add("./sample/sub/file3.txt");
git.status();
git.commit("Second commit");
git.status();

const commits = fs.readdirSync(".mygit/commits/").map(f => f.replace(".json", ""));
git.compareCommits(commits[0], commits[1]);
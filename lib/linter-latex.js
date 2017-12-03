"use babel"

import {CompositeDisposable} from "atom"
import cp from "child_process"

const warning = /^((?:Under|Over)full [^ ]+ \(.*\) in paragraph) at lines (\d+)--(\d+)/m

let cmd

export default {
	subscriptions: null,

	activate() {
		console.log("activation")
		this.subscriptions = new CompositeDisposable()
		this.subscriptions.add(atom.commands.add("atom-workspace", {
			"linter-latex:compile": () => this.compile(),
		}))
	},

	deactivate() {
		console.log("deactivation")
		this.subscriptions.dispose()
	},

	compile() {
		console.log("compile")
		const editor = atom.workspace.getActiveTextEditor()
		const path = editor.getPath()
		const dir = editor.getDirectoryPath()
		cmd = cp.spawn("xelatex", ["-halt-on-error", path], {
			cwd: dir,
		})
		cmd.stdout.on("data", (stdout) => {
			const matches = warning.exec(stdout)
			if (matches) {
				console.log(matches)
				for (let i = parseInt(matches[2]); i <= parseInt(matches[3]); i++) {
					console.log(i, matches[1])
				}
			}
		})
		cmd.stderr.on("data", (stderr) => {
			console.error(stderr.toString())
		})
		cmd.on("close", (code) => {
			console.log(code)
		})
	},
	},
}

console.log("loaded")

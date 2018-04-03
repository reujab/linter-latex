"use babel"

import {CompositeDisposable} from "atom"
import _ from "lodash"
import cp from "child_process"

const warning = /^((?:Under|Over)full [^ ]+ \(.*\) in paragraph) at lines (\d+)--(\d+)/gm
const error = /^! (?:LaTeX Error: )?((?:.|\n(?!l.\d+).)*)[\s\S]*?^l\.(\d+)/gm

export default {
	subscriptions: null,

	activate() {
		this.subscriptions = new CompositeDisposable()
	},

	deactivate() {
		this.subscriptions.dispose()
	},

	provideLinter() {
		return {
			name: "LaTeX",
			scope: "file",
			lintsOnChange: false,
			grammarScopes: ["text.tex.latex"],
			async lint(editor) {
				const path = editor.getPath()
				const dir = editor.getDirectoryPath()
				const cmd = cp.spawn(atom.config.get("linter-latex.compiler"), ["-halt-on-error", ...atom.config.get("linter-latex.extraArguments"), path], {
					cwd: dir,
				})

				const results = []
				await new Promise((resolve, reject) => {
					let stdout = ""

					cmd.stdout.on("data", (chunk) => {
						stdout += chunk
					})
					cmd.on("close", () => {
						while (true) {
							const matches = warning.exec(stdout)
							if (!matches) {
								break
							}

							const start = parseInt(matches[2]) - 1
							const end = parseInt(matches[3]) - 2
							results.push({
								severity: "warning",
								location: {
									file: path,
									position: [[start, 0], [end, editor.buffer.lineLengthForRow(end)]],
								},
								excerpt: matches[1],
							})
						}

						while (true) {
							const matches = error.exec(stdout)
							if (!matches) {
								break
							}

							const line = parseInt(matches[2]) - 1
							results.push({
								severity: "error",
								location: {
									file: path,
									position: [[line, 0], [line, editor.buffer.lineLengthForRow(line)]],
								},
								excerpt: matches[1].replace(/\n/g, ""),
							})
						}

						resolve()
					})
					cmd.on("error", reject)
					cmd.stdin.end()
				})

				return _.uniqWith(results, _.isEqual)
			},
		}
	},
}

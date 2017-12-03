"use babel"

import {CompositeDisposable} from "atom"

console.log("loaded")

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
	},
}

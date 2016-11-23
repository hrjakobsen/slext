function SettingsModule() {
	this.theme = $("select[name='theme']").val();

	this.backgroundColor = "#333";
	this.fileColor = "#A4A4A4";
	this.fileColorHover = "#a93529";
	this.scrollbarBackgroundColor = "#313131";
	this.scrollbarThumbColor = "#535353";
	this.loadingBackgroundColor = "#2B2B2B";
	this.loadingTextColor = "white";
	this.tabBackgroundColor = "#2B2B2B";
	this.tabTextColor = "#bbb";
	this.tabHover = "#333333";

	switch (this.theme) {
		case "chrome":
		case "clouds":
		case "crimson edit":
		case "dawn":
		case "deamweaver":
		case "eclipse":
		case "github":
		case "katzenmilch":
		case "kuroir":
		case "solarized light":
		case "textmate":
		case "tomorrow":
		case "xcode":
			this.backgroundColor = "";
			this.fileColor = "";
			this.fileColorHover = "";
			this.scrollbarBackgroundColor = "#";
			this.scrollbarThumbColor = "#";
			this.loadingBackgroundColor = "#";
			this.loadingTextColor = "";
			this.tabBackgroundColor = "#EEE";
			this.tabTextColor = "#555";
			this.tabHover = "#DDD";
			break;
		default: 
	}
}
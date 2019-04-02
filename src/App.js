import React, { Component } from "react";
import "./App.css";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { Menu } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Speech from "speak-tts";
import "@material/react-switch/dist/switch.css";
import Switch from "@material/react-switch";

class App extends Component {
  state = {
    activeItem: "Editor",
    tweet: "",
    tweets: [],
    checked: false,
    error: false
  };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  handleSubmitTweet = () => {
    if (this.state.checked) {
      let tweets = this.state.tweets;
      tweets.push(this.state.tweet);
      if (this.state.error) {
        this.setState({ tweets, tweet: "", error: !this.state.error });
      }
      this.setState({ tweets, tweet: "" });
    } else {
      this.setState({ error: !this.state.error });
    }
  };

  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  addEmoji = e => {
    //console.log(e.unified)
    if (e.unified.length <= 5) {
      let emojiPic = String.fromCodePoint(`0x${e.unified}`);
      this.setState({
        tweet: this.state.tweet + emojiPic
      });
    } else {
      let sym = e.unified.split("-");
      let codesArray = [];
      sym.forEach(el => codesArray.push("0x" + el));
      //console.log(codesArray.length)
      //console.log(codesArray)  // ["0x1f3f3", "0xfe0f"]
      let emojiPic = String.fromCodePoint(...codesArray);
      this.setState({
        tweet: this.state.tweet + emojiPic
      });
    }
  };

  speakButton = () => {
    const speech = new Speech();
    speech.init({
      volume: 1,
      lang: "en-GB",
      rate: 1,
      pitch: 1,
      voice: "Google UK English Male",
      splitSentences: true
    });

    speech.speak({
      text: `${this.state.tweet}`
    });
  };

  swictchHandler = e => {
    if (this.state.error) {
      this.setState({ error: !this.state.error, checked: e.target.checked });
    }
    this.setState({ checked: e.target.checked });
  };

  render() {
    const { activeItem } = this.state;
    const tweets = this.state.tweets.map((tweet, i) => (
      <li key={i}>{tweet}</li>
    ));

    return (
      <div className="App">
        <Switch
          nativeControlId="my-switch"
          checked={this.state.checked}
          onChange={e => this.setState({ checked: e.target.checked })}
        />
        <label htmlFor="my-switch">
          <span id="switch">{this.state.checked ? "Online" : "Offline"}</span>
        </label>
        <Menu tabular>
          <Menu.Item
            name="Editor"
            active={activeItem === "Editor"}
            onClick={this.handleItemClick}
          />
          {/* <Menu.Item
            name="About"
            active={activeItem === "About"}
            onClick={this.handleItemClick}
          /> */}
        </Menu>
        <div className="textarea-container">
          <h1>Say something with emoji!</h1>
          <h2>
            <div
              className="error"
              style={
                this.state.error ? { display: "block" } : { display: "none" }
              }
            >
              Please click switch above to go online.
            </div>
          </h2>
          <textarea
            onChange={this.changeHandler}
            value={this.state.tweet}
            name="tweet"
            placeholder="What's on your mind?"
          />
          <p>
            <button onClick={this.speakButton}>Listen to message</button>
            <button onClick={this.handleSubmitTweet}>Post your message</button>
          </p>
          <aside>
            <ul style={{ listStyleType: "none" }}>{tweets}</ul>
          </aside>
        </div>
        <div>
          <Picker
            onSelect={this.addEmoji}
            set="twitter"
            title="emojiujitsu"
            i18n={{
              search: "Search",
              categories: {
                search: "Results of search",
                recent: "Recents"
              }
            }}
          />
        </div>
      </div>
    );
  }
}

export default App;

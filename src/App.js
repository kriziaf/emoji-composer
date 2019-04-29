import React, { Component } from "react";
import "./App.css";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import "semantic-ui-css/semantic.min.css";
import Speech from "speak-tts";
import "@material/react-switch/dist/switch.css";
import Switch from "@material/react-switch";

class App extends Component {
  constructor() {
    super();
    this.state = {
      activeItem: "Editor",
      tweet: "",
      tweets: [],
      checked: false,
      error: false,
      emoji: undefined,
      errorMessage:
        "Switch the toggle on top of the screen to go online. You are currently offline."
    };

    this.speech = new Speech();
    this.speech.init({
      volume: 1,
      lang: "en-GB",
      rate: 1,
      pitch: 1,
      voice: "Google UK English Male",
      splitSentences: true
    });

    this.speakTweet = this.speakTweet.bind(this);
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  handleSubmitTweet = () => {
    if (this.state.checked) {
      let tweets = this.state.tweets;
      tweets.push(this.state.tweet);
      if (this.state.error) {
        this.setState({ tweets, tweet: "", error: !this.state.error });
      }
      this.setState({ tweets, tweet: "" });
      this.speech.speak({ text: "Message posted!" });
    } else {
      this.setState({ error: !this.state.error });

      this.speech.speak({
        text: `${this.state.errorMessage}`
      });
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
      this.speech.speak({ text: emojiPic });
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
      this.speech.speak({ text: emojiPic });
    }
  };

  speakButton = () => {
    this.speech.speak({
      text: `${this.state.tweet}`
    });
  };

  swictchHandler = e => {
    if (this.state.error) {
      this.setState({ error: !this.state.error, checked: e.target.checked });
    }
    this.setState({ checked: e.target.checked });
  };

  onFocusHandler = message => {
    this.speech.speak({
      text: message
    });
  };

  switchHandler = e => {
    const status = e.target.checked ? "Online" : "Offline";
    this.setState({ checked: e.target.checked });
    this.speech.speak({ text: status });
  };

  async speakTweet(i) {
    const tweet = this.state.tweets[i];
    let counter = 0;
    for (let ch of tweet) {
      if (
        ch.match(
          /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/
        )
      ) {
        const opts = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: this.emojiUnicode(ch) })
        };

        const emoji = await fetch("http://localhost:3000/api/v1/search", opts)
          .then(res => res.json())
          .then(data => {
            this.setState({ emoji: data });
            return data;
          });

        let popularMeaning = emoji.aliases[0];

        for (let el of emoji.aliases) {
          if (popularMeaning.votes < el.votes) {
            popularMeaning = el;
          }
        }

        const newTweet =
          tweet.slice(0, counter) +
          "emoji " +
          popularMeaning.alias.split("_").join(" ") +
          tweet.slice(counter + ch.length, tweet.length);
        this.speech.speak({ text: newTweet });
      }
      counter++;
    }
  }

  emojiUnicode = emoji => {
    let comp;
    if (emoji.length === 1) {
      comp = emoji.charCodeAt(0);
    }
    comp =
      (emoji.charCodeAt(0) - 0xd800) * 0x400 +
      (emoji.charCodeAt(1) - 0xdc00) +
      0x10000;
    if (comp < 0) {
      comp = emoji.charCodeAt(0);
    }
    return comp.toString("16");
  };

  render() {
    const tweets = this.state.tweets.map((tweet, i) => (
      <li key={i}>
        {tweet}
        <button onClick={() => this.speakTweet(i)}>Listen</button>
      </li>
    ));

    return (
      <div className="App">
        <h1>Emojispeak Composer</h1>
        <div id="switch-container">
          <Switch
            nativeControlId="my-switch"
            checked={this.state.checked}
            onChange={this.switchHandler}
          />
          <label htmlFor="my-switch">
            <span id="switch">{this.state.checked ? "Online" : "Offline"}</span>
          </label>
        </div>
        <div className="textarea-container">
          <h2>
            <div
              className="error"
              style={
                this.state.error ? { display: "block" } : { display: "none" }
              }
            >
              {this.state.errorMessage}
            </div>
          </h2>
          <textarea
            onFocus={e => this.onFocusHandler(e.target.placeholder)}
            onChange={this.changeHandler}
            value={this.state.tweet}
            name="tweet"
            placeholder="What's on your mind?"
          />
          <p>
            <button
              onClick={this.speakButton}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
            >
              Listen to message
            </button>
            <button
              onClick={this.handleSubmitTweet}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
            >
              Post your message
            </button>
          </p>
          <aside>
            <ul style={{ listStyleType: "none" }}>{tweets}</ul>
          </aside>
        </div>
        <div>
          <h2>Click to select emoji</h2>
          <Picker
            onSelect={this.addEmoji}
            set="twitter"
            title="emojispeak"
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

const socket = io();

const messageFormInput = document.getElementById("message-form-input");
const messageButton = document.getElementById("message-button");
const locationButton = document.getElementById("send-location");
const messages = document.getElementById("messages");
const sidebar = document.getElementById("sidebar");
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById(
  "location-message-template"
).innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //New message
  const newMessage = messages.lastElementChild;

  //height of new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = messages.offsetHeight;

  //height of message container
  const containerHeight = messages.scrollHeight;

  //How far have i scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

const showMessage = (event) => {
  event.preventDefault();
  messageButton.setAttribute("disabled", "disabled");
  const message = event.target.message.value;
  socket.emit("sendMessage", message, (error) => {
    messageButton.removeAttribute("disabled");
    messageFormInput.value = "";
    messageFormInput.focus();
    // if (error) {
    //   return console.log(error);
    // }
    // console.log("Message delivered!!");
  });
};

socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (data) => {
  // console.log(data);
  const html = Mustache.render(locationMessageTemplate, {
    username: data.username,
    url: data.url,
    createdAt: moment(data.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    users,
    room,
  });
  sidebar.innerHTML = html;
});

const showLocation = () => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser version");
  }
  locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      (message) => {
        locationButton.removeAttribute("disabled");
        // console.log(message);
      }
    );
  });
};

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

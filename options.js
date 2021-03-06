let // Feeds
    feeds, proxy,
    // Bookmarks
    bookmarksTree, close = 0, favs,
    // News page theme
    colorInputObjects, colorPicker;


const getFeeds = () => {
  return new Promise(resolve => {
    chrome.storage.local.get("newsFeeds", val => {
      feeds = val.newsFeeds;
      resolve(feeds);
    });
  });
}

const saveFeeds = () => {
  chrome.storage.local.set({newsFeeds: feeds}, () => {
    displayMessage("Feeds saved");
  });
}

const getProxy = () => {
  return new Promise(resolve => {
    chrome.storage.local.get("proxy", val => {
      proxy = val.proxy;
      resolve(val.proxy);
    });
  });
}

const saveProxy = () => {
  return new Promise(resolve => {
    const val = document.querySelector("#currentProxy").value;
    chrome.storage.local.set({proxy: val}, () => {
      displayMessage("Proxy saved.");
      resolve(val);
    });
  });
}

const getBookmarks = () => {
  return new Promise(resolve => {
    chrome.bookmarks.getTree(tree => {
      bookmarksTree = tree[0];
      resolve(tree[0]);
    });
  });
}

const getFavIDs = () => {
  return new Promise(resolve => {
    chrome.storage.local.get("fav_ids", value => favs = value.fav_ids);
    resolve(favs);
  })
}

const getColors = () => {
  return new Promise(() => {
    chrome.storage.local.get("newsPageColors" , val => {
      let colors = val.newsPageColors;
      colorKeys = Object.keys(colors);
      colorInputObjects = [];
      for (c of colorKeys) {
        let inputObject = new ColorInput(c, colorPicker, colors[c])
        colorInputObjects[c] = inputObject;
        inputObject.preview();
      }
    });
  });
}

const saveNewsPageTheme = () => {
  let colors = {}, keys = Object.keys(colorInputObjects);
  for (let targ in colorInputObjects) {
    let ob = colorInputObjects[targ];
    console.log(targ);
    colors[ob.id] = ob.elem.value;
  }
  chrome.storage.local.set({newsPageColors: colors}, () => {
    displayMessage("Theme saved.");
  });
}

const loadFeeds = async () => {
  const container = document.querySelector("#feeds");
  await getFeeds();
  feeds.forEach(feed => {
    container.appendChild(buildFeed(feed));
  });
}

const displayProxy = async () => {
  await getProxy();
  document.querySelector("#currentProxy").value = proxy;
}

const buildFeed = feed => {
  const feedDiv = document.createElement("div"),
        name = document.createElement("span"),
        src = document.createElement("span"),
        menuBtn = document.createElement("span");
  
  feedDiv.className = "feed";
  name.className = "name";
  name.textContent = feed[0];

  src.className = "src";
  src.textContent = feed[1];
  
  menuBtn.className = "menuBtn";
  for (let i = 0; i < 3; i++) {
    menuBtn.appendChild(document.createElement("div"));
  }

  menuBtn.addEventListener("click", e => {
    const menu = createMenu(feedDiv);
    console.log(e.pageY, e.pageX);
    menu.style.top = `${e.pageY - 40}px`;
    menu.style.left = `${e.pageX}px`;
  });

  feedDiv.appendChild(name);
  feedDiv.appendChild(src);
  feedDiv.appendChild(menuBtn);
  document.querySelector("#feeds").appendChild(feedDiv);
  return feedDiv;
}

const createMenu = feedDiv => {
  const menu = document.createElement("div"),
        editNameBtn = document.createElement("button"),
        editSrcBtn = document.createElement("button"),
        removeBtn = document.createElement("button");
  
  const index = feedDiv.offsetTop/feedDiv.offsetHeight;

  menu.className = "menu";
  
  editNameBtn.textContent = "Edit Name";
  editNameBtn.addEventListener("click", () => editName(feedDiv, index));

  editSrcBtn.textContent = "Edit Source";
  editSrcBtn.addEventListener("click", () => editSrc(feedDiv, index));

  removeBtn.textContent = "Remove Feed";
  removeBtn.addEventListener("click", () => remove(feedDiv, index));

  menu.appendChild(editNameBtn);
  menu.appendChild(editSrcBtn);
  menu.appendChild(removeBtn);
  
  const removeOnClick = () => {
    menu.remove();
    removeListener();
  }

  const removeListener = () => window.removeEventListener("click",
  removeOnClick);

  setTimeout(() => window.addEventListener("click", removeOnClick), 1);

  document.querySelector("#news").appendChild(menu);

  return menu;
}

const editName = (feed, index) => {
  const form = document.createElement("form"),
        textField = document.createElement("input");

  textField.type = "text";
  textField.value = feed.querySelector(".name").textContent;
  form.append(textField);
  form.addEventListener("submit", event => {
    setName(textField, feed, index)
    preventDefault(event);
    return false;
  });

  feed.querySelector(".name").appendChild(form);

  textField.focus();
  
  const cancelOnClickOutside = event => {
    if (event.target !== textField) {
      form.remove();
      removeListener();
    }
  }

  const cancelOnEsc = event => {
    if (event.keyCode === 27) {
      form.remove()
      removeListener()
    }
  }

  const removeListener = () => {
    window.removeEventListener("click", cancelOnClickOutside);
    window.removeEventListener("keydown", cancelOnEsc);
  }

  setTimeout(() => {
    window.addEventListener("click", cancelOnClickOutside);
    window.addEventListener("keydown", cancelOnEsc);
  }, 1);
}

const editSrc = (feed, index) => {
  const form = document.createElement("form"),
        textField = document.createElement("input");

  textField.type = "text";
  textField.value = feed.querySelector(".src").textContent;
  form.append(textField);
  form.addEventListener("submit", event => {
    setSrc(textField, feed, index)
    preventDefault(event);
    return false;
  });

  feed.querySelector(".src").appendChild(form);

  textField.focus();
  
  const cancelOnClickOutside = event => {
    if (event.target !== textField) {
      form.remove();
      removeListener();
    }
  }

  const cancelOnEsc = event => {
    if (event.keyCode === 27) {
      form.remove()
      removeListener()
    }
  }

  const removeListener = () => {
    window.removeEventListener("click", cancelOnClickOutside);
    window.removeEventListener("keydown", cancelOnEsc);
  }

  setTimeout(() => {
    window.addEventListener("click", cancelOnClickOutside);
    window.addEventListener("keydown", cancelOnEsc);
  }, 1);
}

const setName = (newInput, feed, index) => {
  feeds[index][0] = newInput.value;
  feed.querySelector(".name").textContent = newInput.value;
}

const setSrc = (newInput, feed, index) => {
  feeds[index][1] = newInput.value;
  feed.querySelector(".src").textContent = newInput.value;
}

const remove = (feed, index) => {
  feed.remove();
  feeds.splice(index, 1)
}

const getNewFeed = event => {
  const newFeed = [...event.currentTarget
    .querySelectorAll("input[type='text']")]
    .map(elem => {
      const val = elem.value
      elem.value = "";
      return val;
    });
  if (newFeed[0] && newFeed[1]) {
    document.querySelector("#feeds").appendChild(buildFeed(newFeed));
    feeds.push(newFeed);
  }
  
  event.preventDefault();
  return false;
}

const parseFeedsBlock = () => {
  const block = document.querySelector("#feedsBlock"),
        val = block.value,
        feedsContainer = document.querySelector("#feeds");
  block.value = "";
  newFeeds = val.split("\n").map(line => {
    return line.split(/\s*,\s*/);
  });

  for (feed of newFeeds) {
    if (feed.length === 2 && feed[0] && feed[1]) {
      feedsContainer.appendChild(buildFeed(feed));
      feeds.push(feed);
    }
  }
}

const loadBookmarkFolder = bookmarkTree => {
  const foldersContainer = document.querySelector("#folders"),
        pagesContainer = document.querySelector("#pages"),
        folderFolders = document.createElement("span"),
        folderBookmarks = document.createElement("span");

  folderFolders.className = "folders";
  folderBookmarks.className = "bookmarks";

  for (let bm of bookmarkTree.children) {
    let bookmark = document.createElement("span"),
        iconContainer = document.createElement("span"),
        icon = document.createElement("img"),
        nameContainer = document.createElement("span");
    
    nameContainer.className = "name";
    nameContainer.textContent = bm.title
    
    iconContainer.className = "icon";
    iconContainer.appendChild(icon);

    bookmark.appendChild(iconContainer);
    bookmark.appendChild(nameContainer);

    if (bm.children) {
      icon.src = "folder.ico";

      const action = () => {
        foldersContainer.lastElementChild.className = "folders hidden"
        pagesContainer.lastElementChild.className = "pages hidden";
        loadBookmarkFolder(bm);
      }

      bookmark.className = "folder";
      
      bookmark.addEventListener("click", action);

      folderFolders.appendChild(bookmark);
    } else {
      icon.src = "chrome://favicon/" + bm.url;

      let fav_idsIndex = favs.indexOf(bm.id);

      if (fav_idsIndex + 1) {
        bookmark.className = "page selected";
      } else {
        bookmark.className = "page";
      }

      const action = () => {
        if (bookmark.className === "page" && favs.length < 5) {
          bookmark.className = "page selected";
          favs.push(bm.id);
        } else if (bookmark.className === "page selected") {
          bookmark.className = "page";
          favs = favs.filter(item => item !== bm.id);
        } else {
          displayWarning("Can only favourite 5 bookmarks.")
        }
      }

      bookmark.addEventListener("click", action);

      folderBookmarks.appendChild(bookmark);
    }
  }
  foldersContainer.appendChild(folderFolders);
  pagesContainer.appendChild(folderBookmarks);
}

const loadBookmarks = async () => {
  let getFavs = getFavIDs(),
      getBMs = getBookmarks();
  await getFavs;
  await getBMs;
  loadBookmarkFolder(bookmarksTree);
}

const moveUpDirectory = () => {
  const foldersContainer = document.querySelector("#folders"),
        pagesContainer = document.querySelector("#pages");

  if (foldersContainer.childElementCount > 1) {
    foldersContainer.lastElementChild.remove();
    foldersContainer.lastElementChild.className = "folders";
    pagesContainer.lastElementChild.remove();
    pagesContainer.lastElementChild.className = "pages";
  }
}

const saveFavIDs = () => {
  chrome.storage.local.set({fav_ids: favs}, 
    () => displayMessage("Favourites saved."))
}

const displayMessage = message => {
  const messageContainer = document.querySelector("#message");
  
  messageContainer.textContent = message;

  messageContainer.className = "alert out";
  clearTimeout(close);
  close = setTimeout(() => messageContainer.className = "alert in", 2000);
}

const displayWarning = warning => {
  const messageContainer = document.querySelector("#warning");
  
  messageContainer.textContent = warning;

  messageContainer.className = "alert out";
  clearTimeout(close);
  close = setTimeout(() => messageContainer.className = "alert in", 2000);
}

const setUpColorPicker = () => {
  colorPicker = new ColorPicker();
  colorPicker.bindListeners();
  colorPicker.draw();
}

const previewTheme = e => {
  e.preventDefault();
  for (let c in colorInputObjects) {
    colorInputObjects[c].preview();
  }
}

const switchTab = (tab, section)  => {
  document.querySelector("#tabs .active").className = "inactive";
  document.querySelector(".section.visible").className = "section hidden";
  tab.className = "active";
  section.className = "section visible";
}

const setUpTabs = () => {
  const tabs = [...document.querySelectorAll("#tabs > span")],
        sections = [...document.querySelectorAll(".section")];
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", () => switchTab(tabs[i], sections[i]));
  }
}

const setUpExitBtns = () => {
  const exit = e => e.currentTarget.parentElement.className = "closed";
  for (let btn of [...document.querySelectorAll(".exit")]) {
    btn.addEventListener("click", exit)
  }
}

const opsOnLoad = () => {
  loadFeeds();
  displayProxy();
  loadBookmarks();
  setUpColorPicker();
  getColors();
  setUpTabs();
  setUpExitBtns();
}

(() => {
  window.addEventListener("load", opsOnLoad);

  document.querySelector("#feedsBlock").placeholder = 
  "feed1 name, feed1 RSS link\nfeed2 name, feed2 RSS link\n...";

  document.querySelector("#newFeedForm").addEventListener("submit",
  getNewFeed);

  document.querySelector("#addMultipleFeeds").addEventListener("click",
  () => document.querySelector("#inputFeeds").className = "open");

  document.querySelector("#parseSubmit").addEventListener("click",
  parseFeedsBlock);

  document.querySelector("#saveFeeds").addEventListener("click", saveFeeds);

  document.querySelector("#setProxy").addEventListener("click", saveProxy);

  document.querySelector("#upOne").addEventListener("click", moveUpDirectory);

  document.querySelector("#saveFavs").addEventListener("click", saveFavIDs);

  document.querySelector("#saveTheme").addEventListener("click",
  saveNewsPageTheme)

  document.querySelector("#themeForm").addEventListener("click", previewTheme);
})();
/*global chrome*/
import store from './redux/store';
import * as actions from './redux/actions';

export function init(callback = () => {}) {
  chrome.runtime.sendMessage('init_capture');
  chrome.runtime.onMessage.addListener(msg => {
    if(msg.type === "data") {
      store.dispatch(actions.refreshView(msg.data));
    }
    callback();
  })
}

export function saveViewTree() {
  const viewTree = store.getState().view.viewTree;
  console.log(`trying to save view ${viewTree}`);
  const viewTreeJson = JSON.stringify(viewTree);
  chrome.runtime.sendMessage({
    type: "save_view",
    data: viewTreeJson
  })
}

export async function restoreSavedViewTree(callback = () => {}) {
  console.log('trying to restore view');
  chrome.runtime.sendMessage('get_view', viewTreeJson => {
    if(viewTreeJson !== 'undefined') {
      console.log(viewTreeJson);
      const viewTree = JSON.parse(viewTreeJson);
      store.dispatch(actions.setViewTree({ viewTree }));
    }
    callback();
  })
}

export function removeTabs(tabIds) {
  try {
    chrome.tabs.remove(tabIds);
  } catch (e) { }
}

export function setTabActive(site) {
  try {
    chrome.windows.get(site.windowId, window => {
      if (!window.focused) {
        let updateInfo = {
          focused: true,
        }
        chrome.windows.update(site.windowId, updateInfo, () => {
          chrome.tabs.update(site.id, { active: true });
        });
      } else {
        chrome.tabs.update(site.id, { active: true });
      }
    })
  } catch (e) { }
}
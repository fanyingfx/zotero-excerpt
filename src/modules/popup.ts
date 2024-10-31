import { text } from "stream/consumers";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { getPref, setPref } from "../utils/prefs";
// import { addTranslateTask, getLastTranslateTask } from "../utils/task";

// export function updateReaderPopup() {
//   const popup = addon.data.popup.currentPopup;
//   if (!popup) {
//     return;
//   }
//   const enablePopup = getPref("enablePopup");
//   const hidePopupTextarea = getPref("enableHidePopupTextarea") as boolean;
//   Array.from(popup.querySelectorAll(`.${config.addonRef}-readerpopup`)).forEach(
//     (elem) => ((elem as HTMLElement).hidden = !enablePopup),
//   );

//   const idPrefix = popup?.getAttribute(`${config.addonRef}-prefix`);
//   const makeId = (type: string) => `${idPrefix}-${type}`;
//   const audiobox = popup?.querySelector(
//     `#${makeId("audiobox")}`,
//   ) as HTMLDivElement;
//   const translateButton = popup?.querySelector(
//     `#${makeId("translate")}`,
//   ) as HTMLDivElement;
//   const textarea = popup?.querySelector(
//     `#${makeId("text")}`,
//   ) as HTMLTextAreaElement;
//   const addToNoteButton = popup?.querySelector(
//     `#${makeId("addtonote")}`,
//   ) as HTMLDivElement;

//   const updateHidden = (elem: HTMLElement, hidden: boolean) => {
//     if (hidden) {
//       elem.style.display = "none";
//     } else {
//       elem.style.removeProperty("display");
//     }
//   };

//   if (!enablePopup) {
//     updateHidden(audiobox, true);
//     updateHidden(translateButton, true);
//     updateHidden(textarea, true);
//     updateHidden(addToNoteButton, true);
//     return;
//   }
//   const task = getLastTranslateTask();
//   if (!task) {
//     return;
//   }
//   popup.setAttribute("translate-task-id", task.id);

//   if (task.audio.length > 0 && getPref("showPlayBtn")) {
//     audiobox.innerHTML = "";
//     updateHidden(audiobox, false);
//     ztoolkit.UI.appendElement(
//       {
//         tag: "fragment",
//         children: task.audio.map((audioData) => ({
//           tag: "button",
//           namespace: "html",
//           classList: ["toolbar-button", "wide-button"],
//           attributes: {
//             tabindex: "-1",
//             title: audioData.text,
//           },
//           properties: {
//             innerHTML: `🔊 ${audioData.text}`,
//             onclick: () => {
//               new (ztoolkit.getGlobal("Audio"))(audioData.url).play();
//             },
//           },
//           styles: { whiteSpace: "nowrap", flexGrow: "1" },
//         })),
//       },
//       audiobox,
//     );
//   }
//   updateHidden(translateButton, task.status !== "waiting");

//   textarea.hidden = hidePopupTextarea || task.status === "waiting";
//   textarea.value = task.result || task.raw;
//   textarea.style.fontSize = `${getPref("fontSize")}px`;
//   textarea.style.lineHeight = `${
//     Number(getPref("lineHeight")) * Number(getPref("fontSize"))
//   }px`;
//   updateHidden(addToNoteButton, !ZoteroContextPane.activeEditor);

//   updatePopupSize(popup, textarea);
// }

export function buildReaderPopup(
  event: _ZoteroTypes.Reader.EventParams<"renderTextSelectionPopup">,
) {
  const { reader, doc, append } = event;
  const annotation = event.params.annotation;
  const title = reader._title;

  const popup = doc.querySelector(".selection-popup") as HTMLDivElement;
  // addon.data.popup.currentPopup = popup;
  popup.style.maxWidth = "none";
  popup.setAttribute(
    `${config.addonRef}-prefix`,
    `${config.addonRef}-${reader._instanceID}`,
  );

  const colors = popup.querySelector(".colors") as HTMLDivElement;
  colors.style.width = "100%";
  colors.style.justifyContent = "space-evenly";

  const keepSize = getPref("keepPopupSize") as boolean;

  const makeId = (type: string) =>
    `${config.addonRef}-${reader._instanceID}-${type}`;

  const hidePopupTextarea = getPref("enableHidePopupTextarea") as boolean;
  append(
    ztoolkit.UI.createElement(doc, "fragment", {
      children: [
        {
          tag: "textarea",
          id: makeId("text"),
          attributes: {
            // rows: "3",
            // columns: "10",
          },
          classList: [
            `${config.addonRef}-popup-textarea`,
            `${config.addonRef}-readerpopup`,
          ],
          styles: {
            fontSize: `${getPref("fontSize")}px`,
            fontFamily: "inherit",
            lineHeight: `${
              Number(getPref("lineHeight")) * Number(getPref("fontSize"))
            }px`,
            width: "300px",
            // width: keepSize ? `${getPref("popupWidth")}px` : "-moz-available",
            // height: `${Math.max(
            //   keepSize ? Number(getPref("popupHeight")) : 30,
            // )}px`,
            height: "150px",
            marginLeft: "2px",
          },
          properties: {
            onpointerup: (e: Event) => e.stopPropagation(),
            ondragstart: (e: Event) => e.stopPropagation(),
            spellcheck: false,
            value: addon.data.selectedText,
          },
          ignoreIfExists: true,
        },
        {
          tag: "button",
          namespace: "html",
          id: "save-sentence",
          classList: [
            "toolbar-button",
            "wide-button",
            `${config.addonRef}-readerpopup`,
          ],
          styles: {
            marginTop: "8px",
          },
          properties: {
            innerHTML: "Save Sentence",
          },
          ignoreIfExists: true,
          listeners: [
            {
              type: "click",
              listener: async (event) => {
                const formData = new URLSearchParams();
                formData.append("sentence", annotation.text);
                formData.append("descriptions", title);
                fetch("http://127.0.0.1:5000/submit", {
                  method: "POST",
                  body: formData,
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                });
              },
            },
          ],
        },
        //   listeners: [
        //     {
        //       type: "click",
        //       listener: async (ev) => {
        //         const noteEditor =
        //           ZoteroContextPane && ZoteroContextPane.activeEditor;
        //         if (!noteEditor) {
        //           return;
        //         }
        //         const editorInstance = noteEditor.getCurrentInstance();
        //         if (!editorInstance) {
        //           return;
        //         }
        //         // const task = addTranslateTask(
        //         //   addon.data.translate.selectedText,
        //         //   reader.itemID,
        //         //   "addtonote",
        //         // );
        //         // if (!task) {
        //         //   return;
        //         // }
        //         // await addon.hooks.onTranslate(task, {
        //         //   noCheckZoteroItemLanguage: true,
        //         //   noDisplay: true,
        //         // });
        //         // if (task.status !== "success") {
        //         //   return;
        //         // }
        //         // const replaceMode = getPref("enableNoteReplaceMode") as boolean;
        //         // if (replaceMode) {
        //         //   annotation.text = task.result;
        //         // } else {
        //         //   annotation.comment = task.result;
        //         // }
        //         // // @ts-ignore should be fixed in the zotero-types
        //         // reader._addToNote([annotation]);
        //       },
        //     },
        //   ],
        // },
      ],
    }),
  );
}

function onTextAreaResize(ev: MouseEvent) {
  if (getPref("keepPopupSize")) {
    const textarea = ev.target as HTMLTextAreaElement;
    setPref("popupWidth", textarea.offsetWidth);
    setPref("popupHeight", textarea.offsetHeight);
  }
}

function getOnTextAreaCopy(selectionMenu: HTMLElement, targetId: string) {
  return (ev: KeyboardEvent) => {
    const textarea = selectionMenu.querySelector(
      `#${targetId}`,
    ) as HTMLTextAreaElement;
    const isMod = ev.ctrlKey || ev.metaKey;
    if (ev.key === "c" && isMod) {
      ztoolkit.getGlobal("setTimeout")(() => {
        new ztoolkit.Clipboard()
          .addText(
            textarea.value.slice(
              textarea.selectionStart,
              textarea.selectionEnd,
            ),
            "text/plain",
          )
          .copy();
      }, 10);
      ev.stopPropagation();
    } else if (ev.key === "a" && isMod) {
      textarea.selectionStart = 0;
      textarea.selectionEnd = textarea.value.length;
      ev.stopPropagation();
    } else if (ev.key === "x" && isMod) {
      new ztoolkit.Clipboard()
        .addText(
          textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
          "text/plain",
        )
        .copy();
      textarea.value = `${textarea.value.slice(
        0,
        textarea.selectionStart,
      )}${textarea.value.slice(textarea.selectionEnd)}`;
      ev.stopPropagation();
    }
  };
}

function updatePopupSize(
  selectionMenu: HTMLDivElement,
  textarea: HTMLTextAreaElement,
  resetSize: boolean = true,
): void {
  const keepSize = getPref("keepPopupSize") as boolean;
  if (keepSize) {
    return;
  }
  if (resetSize) {
    textarea.style.width = "-moz-available";
    textarea.style.height = "30px";
  }
  const viewer = selectionMenu.ownerDocument.body;
  // Get current H & W
  const textHeight = textarea.scrollHeight;
  const textWidth = textarea.scrollWidth;
  const newWidth = textWidth + 20;
  // Check until H/W<0.75 and don't overflow viewer border
  if (
    textHeight / textWidth > 0.75 &&
    selectionMenu.offsetLeft + newWidth < viewer.offsetWidth
  ) {
    // Update width
    textarea.style.width = `${newWidth}px`;
    updatePopupSize(selectionMenu, textarea, false);
    return;
  }
  // Update height
  textarea.style.height = `${textHeight + 3}px`;
}

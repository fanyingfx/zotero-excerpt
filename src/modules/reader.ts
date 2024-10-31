import { config } from "../../package.json";
// import { SVGIcon } from "../utils/config";
// import { addTranslateAnnotationTask } from "../utils/task";

export function registerReaderInitializer() {
  Zotero.Reader.registerEventListener(
    "renderTextSelectionPopup",
    (event) => {
      const { reader, doc, params, append } = event;
      addon.data.selectedText = params.annotation.text.trim();
      ztoolkit.log("#annotationData", params.annotation.text.trim());
      addon.hooks.onReaderPopupShow(event);
    },
    config.addonID,
  );
}

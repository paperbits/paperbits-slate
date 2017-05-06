

import { PaperSlate } from './paperslate/editor'
import { initialState } from './paperslate/state'

const paperSlateParentElement = document.body.querySelector('main');

let paperSlate = new PaperSlate();

paperSlate.setInitialState(initialState);

paperSlate = paperSlate.renderToContainer(paperSlateParentElement);


paperSlate.addSelectionChangeListener(() => { console.log("selection change"); });
paperSlate.addDisabledListener(() => { console.log("disabled"); });
paperSlate.addEnabledListener(() => { console.log("enabled"); });
paperSlate.addOpenLinkEditorListener(() => {
    return {
        href: window.prompt("Enter URL:"),
        target: "blank"
    };
});

window["paperSlate"] = paperSlate;
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as injector from "react-frame-aware-selection-plugin";
import { Mark, Raw, Data, State, Change } from "slate";
import { Editor } from "slate-react";
import { Set, Seq, Collection, List, Map } from "immutable";
import { initialState } from "./state";
import { IHyperlink } from "@paperbits/common/permalinks/IHyperlink";
import { SelectionState } from "@paperbits/common/editing/IHtmlEditor";
import { IBag } from "@paperbits/common/core/IBag";

injector();

export class SlateReactComponent extends React.Component<any, any> {
    private static dirtyHack;
    private static DEFAULT_NODE = "paragraph";
    private static DEFAULT_ALIGNMENT = "align-left";
    private static intentionsMap = {};

    private readOnly = true;

    me = null;
    parentElement = null;
    reactElement = null;
    showToolbar = false;

    state = {
        state: State.fromJSON(initialState, { terse: true }),
        getHrefData: null,
        selectionChangeListeners: [],
        disabledListeners: [],
        enabledListeners: []
    }

    constructor(intentionsMap: Object) {
        super();

        Object.assign(SlateReactComponent.intentionsMap, intentionsMap);

        this.getMyself = this.getMyself.bind(this);
        this.renderToContainer = this.renderToContainer.bind(this);
        this.updateState = this.updateState.bind(this);
        this.getState = this.getState.bind(this);
        this.getSelectionPosition = this.getSelectionPosition.bind(this);
        this.setSelectionPosition = this.setSelectionPosition.bind(this);
        this.addSelectionChangeListener = this.addSelectionChangeListener.bind(this);
        this.removeSelectionChangeListener = this.removeSelectionChangeListener.bind(this);
        this.addDisabledListener = this.addDisabledListener.bind(this);
        this.removeDisabledListener = this.removeDisabledListener.bind(this);
        this.addEnabledListener = this.addEnabledListener.bind(this);
        this.removeEnabledListener = this.removeEnabledListener.bind(this);
        this.notifyListeners = this.notifyListeners.bind(this);
        this.addOpenLinkEditorListener = this.addOpenLinkEditorListener.bind(this);
        this.getSelectionState = this.getSelectionState.bind(this);
        this.getIntentions = this.getIntentions.bind(this);
        this.toggleBold = this.toggleBold.bind(this);
        this.toggleItalic = this.toggleItalic.bind(this);
        this.toggleUnderlined = this.toggleUnderlined.bind(this);
        this.toggleUl = this.toggleUl.bind(this);
        this.toggleOl = this.toggleOl.bind(this);
        this.toggleH1 = this.toggleH1.bind(this);
        this.toggleH2 = this.toggleH2.bind(this);
        this.toggleH3 = this.toggleH3.bind(this);
        this.toggleH4 = this.toggleH4.bind(this);
        this.toggleH5 = this.toggleH5.bind(this);
        this.toggleH6 = this.toggleH6.bind(this);
        this.toggleQuote = this.toggleQuote.bind(this);
        this.toggleCode = this.toggleCode.bind(this);
        this.toggleCategory = this.toggleCategory.bind(this);
        this.updateInlineCategory = this.updateInlineCategory.bind(this);
        this.updateBlockCategory = this.updateBlockCategory.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
        this.updateCustomMark = this.updateCustomMark.bind(this);
        this.updateCustomBlock = this.updateCustomBlock.bind(this);
        this.toggleAlignment = this.toggleAlignment.bind(this);
        this.toggleColor = this.toggleColor.bind(this);
        this.resetToNormal = this.resetToNormal.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.setHyperlink = this.setHyperlink.bind(this);
        this.getHyperlink = this.getHyperlink.bind(this);
        this.removeHyperlink = this.removeHyperlink.bind(this);
        this.hasMark = this.hasMark.bind(this);
        this.getMarkData = this.getMarkData.bind(this);
        this.hasBlock = this.hasBlock.bind(this);
        this.has = this.has.bind(this);
        this.isAligned = this.isAligned.bind(this);
        this.findInlineNode = this.findInlineNode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.toggleMark = this.toggleMark.bind(this);
        this.toggleBlock = this.toggleBlock.bind(this);
        this.onClickLink = this.onClickLink.bind(this);
        this.render = this.render.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.createReactElementInternal = this.createReactElementInternal.bind(this);

        if (SlateReactComponent.dirtyHack) {
            let getMyself = SlateReactComponent.dirtyHack;
            this.getMyself = () => this.me ? this.me : (this.me = getMyself());
            SlateReactComponent.dirtyHack = null;
        }
    }

    public getMyself(): SlateReactComponent {
        return this.me;
    }

    public renderToContainer(hostElement: HTMLElement): SlateReactComponent {
        let self = this;

        SlateReactComponent.dirtyHack = () => self.me;

        this.reactElement = React.createElement(SlateReactComponent);
        this.parentElement = hostElement;

        this.me = ReactDOM.render(this.reactElement, hostElement);

        return this.me;
    }

    public applyState(state): void {
        this.setNewState(state);
        this.getMyself().forceUpdate();
    }

    public getState(): Object {
        const st = this.getMyself().state.state.toJSON({ terse: true });
        return st.document;
    }

    public updateState(newState: any): void {
        var st = { document: { nodes: newState.nodes } };

        const state = State.fromJSON(st, { terse: true });
        this.setNewState(state);
    }

    public getSelectionPosition() {
        let state = this.getActualState();

        return {
            "anchorKey": state.selection.anchorKey,
            "anchorOffset": state.selection.anchorOffset,
            "focusKey": state.selection.focusKey,
            "focusOffset": state.selection.focusOffset,
        }
    }

    public setSelectionPosition(selectionPosition, focus) {
        let state: State = this.getActualState();

        if (focus) {
            state = state.change().select(selectionPosition).focus().state;
        }
        else {
            state = state.change().select(selectionPosition).state;
        }

        this.setNewState(state);

        this.getMyself().forceUpdate();
    }

    public addSelectionChangeListener(callback): void {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        selectionChangeListeners.push(callback);

        this.getMyself().setState({ selectionChangeListeners: selectionChangeListeners });
        this.getMyself().forceUpdate();
    }

    public removeSelectionChangeListener(callback): void {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        for (let i = 0; i < selectionChangeListeners.length; i++) {
            if (selectionChangeListeners[i] === callback) {
                selectionChangeListeners.splice(i);
                break;
            }
        }
        this.getMyself().setState({ selectionChangeListeners: selectionChangeListeners });
        this.getMyself().forceUpdate();
    }

    public addDisabledListener(callback): void {
        let { disabledListeners } = this.state;

        disabledListeners.push(callback);

        this.getMyself().setState({ disabledListeners: disabledListeners });
        this.getMyself().forceUpdate();
    }

    public removeDisabledListener(callback): void {
        const disabledListeners = this.state.disabledListeners;

        for (let i = 0; i < disabledListeners.length; i++) {
            if (disabledListeners[i] === callback) {
                disabledListeners.splice(i);
                break;
            }
        }
        this.getMyself().setState({ disabledListeners: disabledListeners });
        this.getMyself().forceUpdate();
    }

    public addEnabledListener(callback): void {
        let { enabledListeners } = this.state;
        enabledListeners.push(callback);
        this.getMyself().setState({ enabledListeners: enabledListeners });
        this.getMyself().forceUpdate();
    }

    public removeEnabledListener(callback): void {
        let { enabledListeners } = this.state;
        for (let i = 0; i < enabledListeners.length; i++) {
            if (enabledListeners[i] === callback) {
                enabledListeners.splice(i);
                break;
            }
        }
        this.getMyself().setState({ enabledListeners: enabledListeners });
        this.getMyself().forceUpdate();
    }

    public notifyListeners(listeners): void {
        for (let i = 0; i < listeners.length; i++) {
            listeners[i]();
        }
    }

    public addOpenLinkEditorListener(callback): void {
        this.getMyself().setState({ getHrefData: callback });
        this.getMyself().forceUpdate();
    }

    public getSelectionState(): SelectionState {
        const state = {
            bold: this.hasMark("bold"),
            italic: this.hasMark("italic"),
            underlined: this.hasMark("underlined"),
            hyperlink: this.findInlineNode("link"),
            h1: this.hasBlock("heading-one"),
            h2: this.hasBlock("heading-two"),
            h3: this.hasBlock("heading-three"),
            h4: this.hasBlock("heading-four"),
            h5: this.hasBlock("heading-five"),
            h6: this.hasBlock("heading-six"),
            quote: this.hasBlock("block-quote"),
            code: this.hasBlock("code"),
            ol: false, // this.hasBlock("numbered-list"),
            ul: false, // this.hasBlock("bulleted-list"),
            intentions: this.getIntentions(),
            normal: false
        }
        const actualState = this.getActualState();
        const document: any = actualState.document;

        state.ol = actualState.blocks.some((block) => {
            return !!document.getClosest(block.key, parent => parent.type === 'numbered-list')
        });

        state.ul = actualState.blocks.some((block) => {
            return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
        });

        state.normal = !(state.h1 || state.h2 || state.h3 || state.h4 || state.h4 || state.h5 || state.h6 || state.quote || state.code);

        return state;
    }

    private getIntentions(): IBag<string[]> {
        const result = {};
        const state = this.getActualState();

        state.blocks.forEach(block => {
            const categories = block.data.get("categories");
            Object.assign(result, categories);
        });

        state.marks.forEach(mark => {
            const categories = mark.data.get("categories");
            Object.assign(result, categories);
        })

        return result;
    }

    public toggleBold(): void {
        this.toggleMark("bold");
        this.getMyself().forceUpdate();
    }

    public toggleItalic(): void {
        this.toggleMark("italic");
        this.getMyself().forceUpdate();
    }

    public toggleUnderlined(): void {
        this.toggleMark("underlined");
        this.getMyself().forceUpdate();
    }

    public toggleUl(): void {
        this.toggleBlock("bulleted-list");
        this.getMyself().forceUpdate();
    }

    public toggleOl(): void {
        this.toggleBlock("numbered-list");
        this.getMyself().forceUpdate();
    }

    public toggleH1(): void {
        this.toggleBlock("heading-one");
        this.getMyself().forceUpdate();
    }

    public toggleH2(): void {
        this.toggleBlock("heading-two");
        this.getMyself().forceUpdate();
    }

    public toggleH3(): void {
        this.toggleBlock("heading-three");
        this.getMyself().forceUpdate();
    }

    public toggleH4(): void {
        this.toggleBlock("heading-four");
        this.getMyself().forceUpdate();
    }

    public toggleH5(): void {
        this.toggleBlock("heading-five");
        this.getMyself().forceUpdate();
    }

    public toggleH6(): void {
        this.toggleBlock("heading-six");
        this.getMyself().forceUpdate();
    }

    public toggleQuote(): void {
        this.toggleBlock("block-quote");
        this.getMyself().forceUpdate();
    }

    public toggleCode(): void {
        this.toggleBlock("code");
        this.getMyself().forceUpdate();
    }

    public changeIntention(category: string, intentionFn: string | string[], type: string, scope: string): void {
        let nodes;
        let changeFn;
        let state: State = this.getActualState();
        const expand = state.isExpanded;
        const selection = state.selection;

        switch (type) {
            case "inline":
                nodes = state.texts;
                changeFn = this.updateInlineCategory;
                break;
            case "block":
                nodes = state.blocks;
                changeFn = this.updateBlockCategory;
                break;
            default:
                throw new Error("Unexpected type value: " + type)
        }
        let change;

        nodes.forEach(function (node) {
            change = state.change().moveToRangeOf(node);

            if (change.state.selection.startKey == selection.startKey &&
                change.state.selection.startOffset < selection.startOffset ||
                change.state.selection.endKey == selection.endKey &&
                change.state.selection.endOffset > selection.endOffset) {

                const newSelection = {
                    anchorKey: change.state.selection.startKey,
                    anchorOffset: change.state.selection.startOffset,
                    focusKey: change.state.selection.endKey,
                    focusOffset: change.state.selection.endOffset
                }

                if (change.state.selection.startKey == selection.startKey && change.state.selection.startOffset < selection.startOffset) {
                    newSelection.anchorKey = selection.startKey
                    newSelection.anchorOffset = selection.startOffset
                }

                if (change.state.selection.endKey == selection.endKey && change.state.selection.endOffset > selection.endOffset) {
                    newSelection.focusKey = selection.endKey
                    newSelection.focusOffset = selection.endOffset
                }

                change = change.select(newSelection);
            }
            change = changeFn(change, node, category, intentionFn, scope);
        }, this);

        if (expand) {
            state = (change ? change : state.change())
                .select(selection)
                .focus()
                .state;
        }

        this.setNewState(state);
        this.getMyself().forceUpdate();
    }
    
    public toggleIntention(category: string, intentionFn: string | string[], type: string): void {
        this.changeIntention(category, intentionFn, type, "intention");
    }
    
    public toggleCategory(category: string, intentionFn: string | string[], type: string): void {
        this.changeIntention(category, intentionFn, type, "category");
    }

    public updateInlineCategory(change, node, category: string, intentionFn: string | string[], scope: string) {
        let data;
        if (change.state.marks.some(m => m.type == "custom")) {
            change.state.marks.forEach(mark => {
                if (mark) {
                    data = mark.data
                }

                let newData = this.updateCategory(data, category, intentionFn, scope);

                change = this.updateCustomMark(change, data, newData, mark);
            })
        }
        else {
            const newData = this.updateCategory(null, category, intentionFn, scope);

            change = this.updateCustomMark(change, data, newData);
        }
        return change;
    }

    public updateBlockCategory(change, node, category: string, intentionFn: string | string[], operation: string) {
        let { data } = node;
        let newData = this.updateCategory(data, category, intentionFn, operation);

        return this.updateCustomBlock(change, data, newData);
    }

    public updateCategory(data, category: string, intentionFn: string | string[], scope: string) {
        if (!data) {
            if (!intentionFn) {
                return null;
            }

            let categories = {};
            if (typeof intentionFn === 'string'){
                categories[category] = [intentionFn]
            } else {
                categories[category] = intentionFn;
            }

            return Data.create({ categories: categories });
        }

        let categories = data.get("categories");

        if (!categories) {
            if (!intentionFn) {
                return data;
            }

            categories = {};
            if (typeof intentionFn === 'string'){
                categories[category] = [intentionFn]
            } else {
                categories[category] = intentionFn;
            }

            return data.set("categories", categories)
        }

        if (!categories[category] || typeof categories[category] === 'string') {
            if (!intentionFn) {
                return data;
            }

            categories = JSON.parse(JSON.stringify(categories))
            if (typeof intentionFn === 'string'){
                categories[category] = [intentionFn]
            } else {
                categories[category] = intentionFn;
            }
            return data.set("categories", categories)
        }

        if (scope === 'intention'){
            let intentions: string[] = categories[category];
            if (typeof intentionFn === 'string'){
                let intentionIndex: number = intentions.findIndex(i => i == intentionFn);
                
                if (intentionIndex >= 0)
                {
                    categories = JSON.parse(JSON.stringify(categories))                    
                    categories[category].splice(intentionIndex, 1);
                    return data.set("categories", categories)
                }
    
                if (intentionFn) {
                    categories = JSON.parse(JSON.stringify(categories))
                    categories[category].push(intentionFn);
                    return data.set("categories", categories);
                }
            } else {
                if (intentionFn) {
                    categories = JSON.parse(JSON.stringify(categories))
                    if (typeof intentionFn === 'string'){
                        categories[category] = [intentionFn]
                    } else {
                        categories[category] = intentionFn;
                    }
                    return data.set("categories", categories);
                }
                else{
                    categories = JSON.parse(JSON.stringify(categories))
                    delete categories[category]
                    return data.set("categories", categories);
                }
            }
            
        }
        else {
            if (intentionFn) {
                categories = JSON.parse(JSON.stringify(categories))
                if (typeof intentionFn === 'string'){
                    categories[category] = [intentionFn]
                } else {
                    categories[category] = intentionFn;
                }
                return data.set("categories", categories);
            }
            else{
                categories = JSON.parse(JSON.stringify(categories))
                delete categories[category];
                return data.set("categories", categories);
            }
        }

        return data;
    }

    private updateCustomMark(change, data, newData, mark?): any {
        if (mark) {
            change = change
                .removeMarkAtRange(change.state.selection, { type: "custom", data: data })
                .toggleMarkAtRange(change.state.selection, { type: "custom", data: newData });
        }
        else {
            change = change
                .toggleMarkAtRange(change.state.selection, { type: "custom", data: newData });
        }
        return change;
    }

    private updateCustomBlock(change, data, newData): Change {
        let block = change.state.blocks.find(_ => true);

        change = change
            .setBlock({
                type: block.type,
                nodes: block.nodes,
                data: newData,
                isVoid: block.isVoid,
                key: block.key
            });

        return change;
    }

    public toggleAlignment(intentionFn: string | string[]) {
        this.toggleCategory("alignment", intentionFn, "block")
    }

    public toggleColor(intentionFn: string | string[]) {
        this.toggleCategory("color", intentionFn, "inline")
    }

    public resetToNormal(): void {
        this.hasBlock("heading-one") && this.toggleH1(),
            this.hasBlock("heading-two") && this.toggleH2(),
            this.hasBlock("heading-three") && this.toggleH3(),
            this.hasBlock("heading-four") && this.toggleH4(),
            this.hasBlock("heading-five") && this.toggleH5(),
            this.hasBlock("heading-six") && this.toggleH6(),
            this.hasBlock("block-quote") && this.toggleQuote(),
            this.hasBlock("code") && this.toggleCode();

        let state = this.getActualState();

        state.blocks.forEach(block => {
            if (block.type == "custom") {
                state = state.change().unwrapBlock(block.type, block.data).state;
            }
        })

        state.marks.forEach(mark => {
            if (mark.type == "custom") {
                state = state.change().removeMark(mark).state;
            }
        })

        this.setNewState(state);
        this.getMyself().forceUpdate();
    }

    public enable(): void {
        this.readOnly = false;
        this.getMyself().forceUpdate();
    }

    public disable(): void {
        this.readOnly = true;
        this.clearSelection();
    }

    private getActualState(): State {
        var me = this.getMyself();

        if (!me) {
            me = this;
        }

        if (me.state.state.state) {
            return me.state.state.state;
        }
        else if (me.state.state) {
            return me.state.state;
        }
        else {
            return me.state;
        }
    }

    public clearSelection(): void {
        const state: State = this.getActualState();
        const change = state.change().blur();

        this.applyState(change.state);
    }

    public getSelectionText(): string {
        const state = this.getActualState();
        return state.texts._tail.array.map(x => x.text).join("");
    }

    public expandSelection(): void {
        let state = this.getActualState();

        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            state = state
                .change()
                .moveToRangeOf(linkNode)
                .focus()
                .state;

            this.applyState(state);
        }
    }

    public setSelection(selection): void {
        if (!selection.anchorNode || !selection.focusNode) {
            return;
        }

        let anchorKey = selection.anchorNode.parentElement.parentElement.attributes.getNamedItem("data-key");
        let focusKey = selection.focusNode.parentElement.parentElement.attributes.getNamedItem("data-key");

        if (!anchorKey || !focusKey) {
            return;
        }

        let newSelection = {
            anchorKey: anchorKey.value,
            anchorOffset: selection.anchorOffset,
            focusKey: focusKey.value,
            focusOffset: selection.focusOffset,
            isFocused: true
        }

        let state = this.getActualState();

        state = state.change().select(newSelection).state;

        this.applyState(state);
    }

    public setHyperlink(hyperlink: IHyperlink): void {
        let state = this.getActualState();

        const hasLink = this.findInlineNode("link");

        const selection = state.selection;

        if (!selection.isExpanded) {
            return;
        }

        if (hasLink) {
            const change = state
                .change()
                .unwrapInlineAtRange(selection, "link");

            state = change.state;
        }

        const change = state
            .change()
            .wrapInline(
            {
                type: "link",
                data: {
                    href: hyperlink.href,
                    target: hyperlink.target,
                    permalinkKey: hyperlink.permalinkKey
                }
            });

        state = change.state;

        const link = state.inlines.find(node => node.type == "link");

        if (link) {
            const change = state.change()
                .moveToRangeOf(link)
                .focus();

            state = change.state;
        }

        this.applyState(state);
    }

    public getHyperlink(): IHyperlink {
        let state = this.getActualState();
        const hasInline = this.findInlineNode("link");

        let link = state.inlines.find(node => node.type == "link");

        if (!link) {
            return null;
        }

        let hyperlink: any = {};
        let dataEntries = link.data._root.entries;

        for (let i = 0; i < dataEntries.length; i++) {
            hyperlink[dataEntries[i][0]] = dataEntries[i][1];
        }

        return hyperlink;
    }

    public removeHyperlink(): void {
        const state = this.getActualState();
        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            const change = state
                .change()
                .unwrapInline("link");

            this.applyState(change.state);
        }
    }

    /**
     * Check if the current selection has a mark with `type` in it.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasMark(type): boolean {
        let state = this.getActualState();
        return state.marks.some(mark => mark.type == type)
    }

    private getMarkData(type) {
        let state = this.getActualState();
        let mark = state.marks.first(function (e) {
            return e.type == type
        });
        if (mark) {
            var style = mark.data.get("style");
            return style ? style : null
        }
        return null
    }

    /**
     * Check if the any of the currently selected blocks are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasBlock(type): boolean {
        let state = this.getActualState();
        return state.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks have the same data.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private has(type): boolean {
        let state = this.getActualState();
        return state.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks has alignment of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private isAligned(type): boolean {
        let state = this.getActualState();
        return state.blocks.some(node => node.data.get("alignment") == type)
    }

    /**
     * Check if the any of the currently selected inlines are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private findInlineNode(type): any {
        const state = this.getActualState();
        return state.inlines.find(node => node.type == type)
    }

    private setNewState(state): void {
        var actualState;

        if (state.state) {
            actualState = state.state;
        }
        else {
            actualState = state;
        }

        if (this.getMyself()) {
            this.getMyself().setState({ state: actualState });
        }
        else {
            this.setState({ state: actualState });
        }
    }

    /**
     * On change, save the new state.
     *
     * @param {Change} change
     */
    public onChange(change: Change): void {
        this.setNewState(change.state);

        const myself = this.getMyself();
        myself.state.state = change.state;
        myself.forceUpdate();

        if (change && 
            change.operations && 
            change.operations.length === 1 &&
            change.operations[0]["properties"] && 
            change.operations[0]["properties"].isFocused === false){
                return;
            }

        this.notifyListeners(myself.state.selectionChangeListeners);
    }

    /**
     * On key down, if it"s a formatting command toggle a mark.
     *
     * @param {Event} e
     * @param {Object} data
     * @param {State} state
     * @return {State}
     */
    private onKeyDown(e, data, state) {
        if (!data.isMod)
            return;

        let mark;

        switch (data.key) {
            case "b":
                mark = "bold";
                break;
            case "i":
                mark = "italic";
                break;
            case "u":
                mark = "underlined";
                break;
            case "`":
                mark = "code";
                break;
            default:
                return;
        }

        state = state

            .change()
            .toggleMark(mark)
            .state;

        e.preventDefault();

        return state;
    }

    public toggleMark(type: string): void {
        let state = this.getActualState();
        const expand = state.isExpanded;
        const selection = state.selection

        let change = state
            .change()
            .toggleMark(type);

        if (expand) {
            change = change
                .select(selection)
                .focus();
        }

        this.setNewState(change.state);
    }

    private toggleBlock(type: string): void {
        let state = this.getActualState();
        let change = state.change();

        const { document } = state;

        // Handle everything but list buttons.
        if (type != "bulleted-list" && type != "numbered-list") {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock("list-item");

            if (isList) {
                change = change
                    .setBlock({ type: isActive ? SlateReactComponent.DEFAULT_NODE : type })
                    .unwrapBlock("bulleted-list")
                    .unwrapBlock("numbered-list")
            }
            else {
                change = change
                    .setBlock({ type: isActive ? SlateReactComponent.DEFAULT_NODE : type })
            }
        }

        // Handle the extra wrapping required for list buttons.
        else {
            const isList = this.hasBlock("list-item");
            const isType = state.blocks.some((block) => {
                return !!document.getClosest(block.key, parent => parent.type == type)
            });

            if (isList && isType) {
                change = change
                    .setBlock({ type: SlateReactComponent.DEFAULT_NODE })
                    .unwrapBlock("bulleted-list")
                    .unwrapBlock("numbered-list")
            }
            else if (isList) {
                change = change
                    .unwrapBlock(type == "bulleted-list" ? "numbered-list" : "bulleted-list")
                    .wrapBlock(type)
            }
            else {
                change = change
                    .setBlock({ type: "list-item" })
                    .wrapBlock(type)
            }
        }

        state = change.state;

        this.setNewState(state);
    }

    public onClickLink(): void {
        let state = this.getActualState();

        if (!state.isExpanded) {
            return;
        }

        let { anchorOffset, focusOffset } = state.selection;

        const hasLink = this.findInlineNode("link");

        if (hasLink) {
            state = state
                .change()
                .unwrapInline("link")
                .state;
        }

        const hrefData = this.getMyself().state.getHrefData();

        state = state
            .change()
            .wrapInline({
                type: "link",
                data: hrefData
            })
            .moveToOffsets(anchorOffset, focusOffset)
            .state;

        this.setNewState(state);
    }

    /**
     * Render.
     *
     * @return {Element}
     */
    public render(): JSX.Element {
        return this.renderEditor();
    }

    /**
     * Render the Slate editor.
     *
     * @return {Element}
     */
    public renderEditor(): JSX.Element {
        let editor = <Editor
            placeholder={"Enter some rich text..."}
            state={this.state.state}
            schema={this.Configuration.Schema}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            readOnly={this.readOnly}
            spellCheck={false}
        />;

        return editor
    }

    private createReactElement(tagName) {
        return properties => {
            return this.createReactElementInternal(tagName, properties);
        }
    }

    private createReactElementInternal(tagName: string, properties: any): JSX.Element {
        const data = properties.mark ? properties.mark.data : properties.node.data;
        const categories = data.get("categories");

        if (!categories) {
            return React.createElement(tagName, properties.attributes, properties.children);
        }

        const attributes = properties.attributes || {};

        // TODO: Make universal!!!
        const classNameCategoryKeys = Object.keys(categories).filter(x => x !== "anchorKey" && x !== "anchorId");

        if (classNameCategoryKeys.length > 0) {
            const className = classNameCategoryKeys
                .map(category => categories[category])
                .map((intentionFns: () => string[]) => {
                    if (typeof intentionFns === "string"){
                        const intentionFunc = SlateReactComponent.intentionsMap[intentionFns];
                        
                        if (!intentionFunc) {
                            console.warn(`Could not find intention with key ${intentionFns}`);
                            return "";
                        }
    
                        return intentionFunc();
                    }
                    let intentions: string[] = new Array<string>();
                    for (var i = 0; i < intentionFns.length; i++) {
                        const intentionFunc = SlateReactComponent.intentionsMap[intentionFns[i]];
                        
                        if (!intentionFunc) {
                            console.warn(`Could not find intention with key ${intentionFns}`);
                            return "";
                        }
                        intentions[i] = intentionFunc.styles();
                    }

                    return intentions.join(" ");
                })
                .join(" ");

            Object.assign(attributes, { className: className });
        }

        // TODO: Switch to node.data
        const anchorCategoryKey = Object.keys(categories).find(x => x === "anchorId");

        if (anchorCategoryKey) {
            const id = categories[anchorCategoryKey];

            Object.assign(attributes, { id: id });
        }

        return properties.children ? React.createElement(tagName, attributes, properties.children) : React.createElement(tagName, attributes);
    }

    private createLinkElement() {
        return properties => {
            const { data } = properties.node;
            const href = data.get("href");
            const target = data.get("target");

            Object.assign(properties.attributes, { href: href, target: target });

            return this.createReactElementInternal("a", properties);
        }
    }

    private Configuration = {
        IntentionsMap: {},
        Schema: {
            nodes: {
                "block-quote": this.createReactElement("blockquote"),
                "bulleted-list": this.createReactElement("ul"),
                "heading-one": this.createReactElement("h1"),
                "heading-two": this.createReactElement("h2"),
                "heading-three": this.createReactElement("h3"),
                "heading-four": this.createReactElement("h4"),
                "heading-five": this.createReactElement("h5"),
                "heading-six": this.createReactElement("h6"),
                "list-item": this.createReactElement("li"),
                "numbered-list": this.createReactElement("ol"),
                "link": this.createLinkElement(),
                "code": this.createReactElement("pre"),
                "paragraph": this.createReactElement("p"),
                "custom": this.createReactElement("div")
            },
            marks: {
                bold: this.createReactElement("b"),
                italic: this.createReactElement("i"),
                underlined: this.createReactElement("u"),
                custom: this.createReactElement("span")
            }
        }
    }
}
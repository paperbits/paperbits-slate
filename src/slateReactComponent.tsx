import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as injector from 'react-frame-aware-selection-plugin';
import { Editor, Mark, Raw, Data } from 'slate'
import { Set, Seq, Collection, List, Map } from 'immutable';
import { initialState } from './state';
import { Utils } from "./utils";
import { IHyperlink } from "@paperbits/common/permalinks/IHyperlink";

injector();

export class SlateReactComponent extends React.Component<any, any> {
    static dirtyHack;
    static DEFAULT_NODE = "paragraph";
    static DEFAULT_ALIGNMENT = "align-left";

    private readOnly = true;

    me = null;
    parentElement = null;
    reactElement = null;
    showToolbar = false;

    state = {
        state: Raw.deserialize(initialState, { terse: true }),
        getHrefData: null,
        selectionChangeListeners: [],
        disabledListeners: [],
        enabledListeners: []
    }

    constructor(intentionsMap: Object) {
        super();

        Object.assign(Utils.Configuration.IntentionsMap, intentionsMap);

        this.getMyself = this.getMyself.bind(this);
        this.renderToContainer = this.renderToContainer.bind(this);
        this.setInitialState = this.setInitialState.bind(this);
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
        this.setIntention = this.setIntention.bind(this);
        this.resetIntention = this.resetIntention.bind(this);
        this.changeIntention = this.changeIntention.bind(this);
        this.toggleCategory = this.toggleCategory.bind(this);
        this.toggleInlineCategory = this.toggleInlineCategory.bind(this);
        this.changeIntentionForInline = this.changeIntentionForInline.bind(this);
        this.toggleBlockCategory = this.toggleBlockCategory.bind(this);
        this.changeIntentionForBlock = this.changeIntentionForBlock.bind(this);
        this.createOrUpdateCategory = this.createOrUpdateCategory.bind(this);
        this.createOrUpdateIntention = this.createOrUpdateIntention.bind(this);
        this.updateCustomMark = this.updateCustomMark.bind(this);
        this.updateCustomBlock = this.updateCustomBlock.bind(this);
        this.toggleAlignment = this.toggleAlignment.bind(this);
        this.toggleColor = this.toggleColor.bind(this);
        this.resetToNormal = this.resetToNormal.bind(this);
        this.resetAllIntentions = this.resetAllIntentions.bind(this);
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
        this.hasInline = this.hasInline.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClickStyled = this.onClickStyled.bind(this);
        this.onClickMark = this.onClickMark.bind(this);
        this.onClickRemoveMark = this.onClickRemoveMark.bind(this);
        this.onClickInline = this.onClickInline.bind(this);
        this.onClickAlign = this.onClickAlign.bind(this);
        this.onClickBlock = this.onClickBlock.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onClickLink = this.onClickLink.bind(this);
        this.render = this.render.bind(this);
        this.renderToolbar = this.renderToolbar.bind(this);
        this.renderMarkButton = this.renderMarkButton.bind(this);
        this.renderBlockButton = this.renderBlockButton.bind(this);
        this.renderAlignButton = this.renderAlignButton.bind(this);
        this.renderInlineButton = this.renderInlineButton.bind(this);
        this.renderEditor = this.renderEditor.bind(this);

        if (SlateReactComponent.dirtyHack) {
            let getMyself = SlateReactComponent.dirtyHack;
            this.getMyself = () => this.me ? this.me : (this.me = getMyself());
            SlateReactComponent.dirtyHack = null;
        }
    }

    public getMyself(): SlateReactComponent {
        return this.me;
    }

    public renderToContainer(parentElement: HTMLElement): SlateReactComponent {
        let self = this;

        SlateReactComponent.dirtyHack = () => self.me;

        this.reactElement = React.createElement(SlateReactComponent);
        this.parentElement = parentElement;

        this.me = ReactDOM.render(this.reactElement, parentElement, () => { });

        return this.me;
    }

    public setInitialState(initialState): void {
        this.state.state = Raw.deserialize(initialState, { terse: true });
    }

    public updateState(newState): void {
        let state = Raw.deserialize(newState, { terse: true });
        this.getMyself().setState({ state })
    }

    public getState() {
        return Raw.serialize(this.getMyself().state.state, { terse: true });
    }

    public getSelectionPosition() {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        return {
            "anchorKey": state.selection.anchorKey,
            "anchorOffset": state.selection.anchorOffset,
            "focusKey": state.selection.focusKey,
            "focusOffset": state.selection.focusOffset,
        }
    }

    public setSelectionPosition(selectionPosition, focus) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        if (focus) {
            state = state.transform().select(selectionPosition).focus().apply();
        }
        else {
            state = state.transform().select(selectionPosition).apply();
        }
        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }

        this.getMyself().forceUpdate();
    }

    public addSelectionChangeListener(callback) {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        selectionChangeListeners.push(callback);

        this.getMyself().setState({ selectionChangeListeners: selectionChangeListeners });
        this.getMyself().forceUpdate();
    }

    public removeSelectionChangeListener(callback): void {
        let { selectionChangeListeners } = this.state;
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
        let { disabledListeners } = this.state;
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

    public getSelectionState() {
        const state = {
            bold: this.hasMark('bold'),
            italic: this.hasMark('italic'),
            underlined: this.hasMark('underlined'),
            hyperlink: this.hasInline('link'),
            h1: this.hasBlock('heading-one'),
            h2: this.hasBlock('heading-two'),
            h3: this.hasBlock('heading-three'),
            h4: this.hasBlock('heading-four'),
            h5: this.hasBlock('heading-five'),
            h6: this.hasBlock('heading-six'),
            quote: this.hasBlock('block-quote'),
            code: this.hasBlock('code'),
            ol: this.hasBlock('numbered-list'),
            ul: this.hasBlock('bulleted-list'),
            intentions: this.getIntentions(),
            normal: false
        }

        state.normal = !(state.h1 || state.h2 || state.h3 || state.h4 || state.h4 || state.h5 || state.h6 || state.quote || state.code);

        return state;
    }

    public getIntentions() {
        var result = {
            block: [],
            inline: []
        }

        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        let { blocks } = state;

        let blockIntentions

        blocks.forEach(block => {
            let intentions = block.data.get("intentions");
            let categories = block.data.get("categories");

            if (!intentions && !categories) {
                return;
            }

            if (!intentions) {
                intentions = Seq(categories).map(v => v)
            } else if (categories) {
                intentions = intentions.union(Seq(categories).map(v => v))
            }

            if (!intentions) {
                return;
            }

            if (!blockIntentions) {
                blockIntentions = intentions
            }
            else {
                blockIntentions = Set(blockIntentions).intersect(intentions).toArray()
            }
        })

        result.block = blockIntentions && blockIntentions || []

        let { marks } = state

        let inlineIntentions

        marks.forEach(mark => {
            let intentions = mark.data.get("intentions");
            let categories = mark.data.get("categories");

            if (!intentions && !categories) {
                return;
            }

            if (!intentions) {
                intentions = Seq(categories).map(v => v)
            } else if (categories) {
                intentions = intentions.union(Seq(categories).map(v => v))
            }

            if (!intentions) {
                return;
            }

            if (!inlineIntentions) {
                inlineIntentions = intentions
            }
            else {
                inlineIntentions = Set(inlineIntentions).intersect(intentions).toArray()
            }
        })

        result.inline = inlineIntentions && inlineIntentions || []

        return result;
    }

    public toggleBold(): void {
        this.onClickMark('bold');
        this.getMyself().forceUpdate();
    }

    public toggleItalic(): void {
        this.onClickMark('italic');
        this.getMyself().forceUpdate();
    }

    public toggleUnderlined(): void {
        this.onClickMark('underlined');
        this.getMyself().forceUpdate();
    }

    public toggleUl(): void {
        this.onClickBlock('bulleted-list');
        this.getMyself().forceUpdate();
    }

    public toggleOl(): void {
        this.onClickBlock('numbered-list');
        this.getMyself().forceUpdate();
    }

    public toggleH1(): void {
        this.onClickBlock('heading-one');
        this.getMyself().forceUpdate();
    }

    public toggleH2(): void {
        this.onClickBlock('heading-two');
        this.getMyself().forceUpdate();
    }

    public toggleH3(): void {
        this.onClickBlock('heading-three');
        this.getMyself().forceUpdate();
    }

    public toggleH4(): void {
        this.onClickBlock('heading-four');
        this.getMyself().forceUpdate();
    }

    public toggleH5(): void {
        this.onClickBlock('heading-five');
        this.getMyself().forceUpdate();
    }

    public toggleH6(): void {
        this.onClickBlock('heading-six');
        this.getMyself().forceUpdate();
    }

    public toggleQuote(): void {
        this.onClickBlock('block-quote');
        this.getMyself().forceUpdate();
    }

    public toggleCode(): void {
        this.onClickBlock('code');
        this.getMyself().forceUpdate();
    }

    public setIntention(intentionFn, type): void {
        this.changeIntention(intentionFn, type, 'set');
    }

    public resetIntention(intentionFn, type): void {
        this.changeIntention(intentionFn, type, 'reset');
    }

    public changeIntention(intentionFn, type, operation): void {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        let isExpanded = state.isExpanded
        let selection = state.selection;
        let nodes;
        let change;

        switch (type) {
            case 'block':
                nodes = state.blocks;
                change = this.changeIntentionForBlock
                break
            case 'inline':
                nodes = state.texts;
                change = this.changeIntentionForInline
                break
            default:
                throw new Error("Unexpected type value: " + type)
        }

        nodes.forEach(function (node) {
            state = state.transform().moveToRangeOf(node).apply();
            state = change(state, node, intentionFn, type, operation);
        }, this);


        if (isExpanded) {
            state = state.transform().select(selection).focus().apply()
        }

        this.getMyself() ? this.getMyself().setState({ state: state }) : this.setState({ state: state });
        this.getMyself().forceUpdate();
    }

    public toggleCategory(category, intentionFn, type): void {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        let isExpanded = state.isExpanded
        let selection = state.selection

        let nodes;
        let toggle;
        switch (type) {
            case 'block':
                nodes = state.blocks;
                toggle = this.toggleBlockCategory
                break
            case 'inline':
                nodes = state.texts;
                toggle = this.toggleInlineCategory
                break
            default:
                throw new Error("Unexpected type value: " + type)
        }

        nodes.forEach(function (node) {
            state = state.transform().moveToRangeOf(node).apply();
            if (state.selection.startKey == selection.startKey && state.selection.startOffset < selection.startOffset ||
                state.selection.endKey == selection.endKey && state.selection.endOffset > selection.endOffset) {
                let newSelection = {
                    anchorKey: state.selection.startKey,
                    anchorOffset: state.selection.startOffset,
                    focusKey: state.selection.endKey,
                    focusOffset: state.selection.endOffset
                }
                if (state.selection.startKey == selection.startKey && state.selection.startOffset < selection.startOffset) {
                    newSelection.anchorKey = selection.startKey
                    newSelection.anchorOffset = selection.startOffset
                }
                if (state.selection.endKey == selection.endKey && state.selection.endOffset > selection.endOffset) {
                    newSelection.focusKey = selection.endKey
                    newSelection.focusOffset = selection.endOffset
                }
                state = state.transform().select(newSelection).apply();
            }
            state = toggle(state, node, category, intentionFn, type);
        }, this);


        if (isExpanded) {
            state = state.transform().select(selection).focus().apply()
        }

        this.getMyself() ? this.getMyself().setState({
            state: state
        }) : this.setState({
            state: state
        })

        this.getMyself().forceUpdate();
    }

    public toggleInlineCategory(state, node, category, intentionFn, type) {
        let data;
        if (state.marks.some(m => m.type == "custom")) {
            state.marks.forEach(mark => {
                if (mark) {
                    data = mark.data
                }

                let newData = this.createOrUpdateCategory(data, category, intentionFn);

                state = this.updateCustomMark(state, data, newData, category, intentionFn, mark)
            })
        }
        else {
            let newData = this.createOrUpdateCategory(null, category, intentionFn);

            state = this.updateCustomMark(state, data, newData, category, intentionFn)
        }
        return state;
    }

    public changeIntentionForInline(state, node, intentionFn, type, operation, category) {
        let data;
        let mark = state.marks.find(m => m.type == 'custom');
        if (mark) {
            data = mark.data
        }
        let newData = this.createOrUpdateIntention(data, intentionFn, operation);

        return this.updateCustomMark(state, data, newData, category, intentionFn);
    }

    public toggleBlockCategory(state, node, category, intentionFn, type) {
        let { data } = node;
        let newData = this.createOrUpdateCategory(data, category, intentionFn);

        return this.updateCustomBlock(state, data, newData);
    }

    public changeIntentionForBlock(state, node, intentionFn, type, operation) {
        let { data } = node;
        let newData = this.createOrUpdateIntention(data, intentionFn, operation);

        return this.updateCustomBlock(state, data, newData);
    }

    public createOrUpdateCategory(data, category, intentionFn) {
        if (!data) {

            if (!intentionFn) {
                return null;
            }

            let categories = {};
            categories[category] = intentionFn

            return Data.create({
                categories: categories
            })
        }


        let categories = data.get("categories");

        if (!categories) {

            if (!intentionFn) {
                return data;
            }

            categories = {};
            categories[category] = intentionFn

            return data.set("categories", categories)
        }


        if (!categories[category]) {
            if (!intentionFn) {
                return data;
            }

            categories = JSON.parse(JSON.stringify(categories))
            categories[category] = intentionFn
            return data.set("categories", categories)
        }

        if ((categories[category] == intentionFn || !intentionFn)) {
            categories = JSON.parse(JSON.stringify(categories))
            delete categories[category]
            return data.set("categories", categories)
        }

        categories = JSON.parse(JSON.stringify(categories))
        categories[category] = intentionFn

        return data.set("categories", categories)
    }

    public createOrUpdateIntention(data, intentionFn, operation) {
        let subj = [intentionFn]
        if (!data) {
            if (operation == 'reset') {
                return null;
            }
            return Data.create({
                intentions: subj
            })
        }

        let intentions = data.get("intentions");
        if (!intentions) {
            return data;
        }

        if (operation == 'set') {
            intentions = Set(intentions).union(subj)
        }
        else {
            intentions = Set(intentions).subtract(subj)
        }
        data = data.set('intentions', intentions.toArray())

        return data;
    }

    public updateCustomMark(state, data, newData, category, intentionFn, mark?) {
        if (mark) {
            // if (!intentionFn &&
            //     (mark.type == "custom" &&
            //         mark.data &&
            //         mark.data.get("categories") &&
            //         mark.data.get("categories").length == 1 &&
            //         mark.data.get("categories")[category] == intentionFn)) {
            //     state = state.transform()
            //         .removeMarkAtRange(state.selection, { type: "custom", data: data }).apply();
            // }
            // else 
            {
                state = state.transform()
                    .removeMarkAtRange(state.selection, { type: "custom", data: data })
                    .toggleMarkAtRange(state.selection, { type: "custom", data: newData }).apply();
            }
        }
        else {
            state = state.transform().toggleMarkAtRange(state.selection, { type: "custom", data: newData }).apply();
        }
        return state;
    }

    public updateCustomBlock(state, data, newData) {
        let block = state.blocks.find(_ => true);

        state = state.transform()
            .setBlock({
                type: block.type,
                nodes: block.nodes,
                data: newData,
                isVoid: block.isVoid,
                key: block.key
            })
            .apply()

        return state;
    }

    public toggleAlignment(intentionFn) {
        this.toggleCategory('alignment', intentionFn, 'block')
    }

    public toggleColor(intentionFn) {
        this.toggleCategory('color', intentionFn, 'inline')
    }

    public resetToNormal() {
        this.hasBlock("heading-one") && this.toggleH1(),
            this.hasBlock("heading-two") && this.toggleH2(),
            this.hasBlock("heading-three") && this.toggleH3(),
            this.hasBlock("heading-four") && this.toggleH4(),
            this.hasBlock("heading-five") && this.toggleH5(),
            this.hasBlock("heading-six") && this.toggleH6(),
            this.hasBlock("block-quote") && this.toggleQuote(),
            this.hasBlock("code") && this.toggleCode();
        this.resetAllIntentions();
    }

    public resetAllIntentions() {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        state.blocks.forEach(block => {
            if (block.type == 'custom') {
                state = state.transform().unwrapBlock(block.type, block.data).apply()
            }
        })

        state.marks.forEach(mark => {
            if (mark.type == 'custom') {
                state = state.transform().removeMark(mark).apply()
            }
        })


        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
        this.getMyself().forceUpdate();
    }

    public enable(): void {
        this.readOnly = false;
        this.getMyself().forceUpdate();
    }

    public disable(): void {
        this.readOnly = true;
        this.getMyself().forceUpdate();
    }

    public setHyperlink(hyperlinkData): void {
        this.getMyself().forceUpdate();

        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        const hasLink = this.hasInline('link');

        let { selection } = state;

        if (!selection.isExpanded) {
            return;
        }

        if (hasLink) {
            state = state
                .transform()
                .unwrapInlineAtRange(selection, 'link')
                .apply();
        }

        state = state.transform()
            .wrapInline(
            {
                type: 'link',
                data: {
                    href: hyperlinkData.href,
                    target: hyperlinkData.target
                }
            })
            .apply();

        let link = state.inlines.find(node => node.type == 'link');

        state = state.transform()
            .extendToEndOf(link)
            .focus()
            .apply();

        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
        this.getMyself().forceUpdate();
    }

    public getHyperlink(): IHyperlink {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        const hasInline = this.hasInline('link');

        let link = state.inlines.find(node => node.type == 'link');

        if (!link) {
            return null;
        }

        let data: any = {};
        let dataEntries = link.data._root.entries;

        for (let i = 0; i < dataEntries.length; i++) {
            data[dataEntries[i][0]] = dataEntries[i][1];
        }

        return data;
    }

    public removeHyperlink() {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        const hasInline = this.hasInline('link');

        if (hasInline) {
            state = state
                .transform()
                .unwrapInline('link')
                .apply();
        }
        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
        this.getMyself().forceUpdate();
    }


    // private

    /**
     * Check if the current selection has a mark with `type` in it.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasMark(type): boolean {
        const { state } = this.getMyself() ? this.getMyself().state : this.state;
        return state.marks.some(mark => mark.type == type)
    }

    private getMarkData(type) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
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
    private hasBlock(type) {
        const { state } = this.getMyself() ? this.getMyself().state : this.state;
        return state.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks have the same data.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private has(type) {
        const { state } = this.getMyself() ? this.getMyself().state : this.state;
        return state.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks has alignment of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private isAligned(type) {
        const { state } = this.getMyself() ? this.getMyself().state : this.state;
        return state.blocks.some(node => node.data.get("alignment") == type)
    }

    /**
     * Check if the any of the currently selected inlines are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasInline(type): boolean {
        const { state } = this.getMyself() ? this.getMyself().state : this.state;
        return state.inlines.some(node => node.type == type)
    }

    private onSelectionChange(selection, state) {
        this.getMyself().setState({ state });
        this.getMyself().state.state = state;
        this.getMyself().forceUpdate();
        this.notifyListeners(this.getMyself().state.selectionChangeListeners);
    }

    /**
     * On change, save the new state.
     *
     * @param {State} state
     */
    public onChange(state) {
        this.setState({ state });
    }

    /**
     * On key down, if it's a formatting command toggle a mark.
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
            case 'b':
                mark = 'bold';
                break;
            case 'i':
                mark = 'italic';
                break;
            case 'u':
                mark = 'underlined';
                break;
            case '`':
                mark = 'code';
                break;
            default:
                return;
        }

        state = state
            .transform()
            .toggleMark(mark)
            .apply();

        e.preventDefault();

        return state;
    }

    private onClickStyled(style) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state
        let isExpanded = state.isExpanded
        let selection = state.selection
        let mark = state.marks.find((m) => {
            return "styled" == m.type
        });
        if (mark) {
            state = state.transform().removeMark("styled").apply();
            if (mark.data.get("style")) {
                (style = Object.assign(mark.data.get("style"), style))
            }
        }
        ;
        var data = Data.create({
            style: style
        });
        state = state.transform().addMark({
            type: "styled",
            data: data
        }).apply();

        if (isExpanded) {
            state = state.transform().select(selection).apply()
        }

        this.getMyself() ? this.getMyself().setState({
            state: state
        }) : this.setState({
            state: state
        })
    }

    /**
     * When a mark button is clicked, toggle the current mark.
     *
     * @param {String} type
     */
    public onClickMark(type) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        let expand = state.isExpanded;
        let { selection } = state;

        state = state
            .transform()
            .toggleMark(type)
            .apply();

        if (expand) {
            state = state
                .transform()
                .select(selection)
                .apply();
        }

        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
    }

    public onClickRemoveMark(type) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state
        let isExpanded = state.isExpanded;
        let selection = state.selection;
        let mark = state.marks.find(function (e) { return e.type == type })

        for (; mark;) {
            state = state.transform().removeMark(mark).apply();

            if (isExpanded) {
                state = state.transform().select(selection).apply()
            }

            this.getMyself() ?
                this.getMyself().setState({
                    state: state
                }) :
                this.setState({
                    state: state
                });

            mark = state.marks.find(function (m) {
                return m.type == type
            })
        }
    }

    /**
     * When a inline button is clicked, toggle the inline type.
     *
     * @param {String} type
     */
    public onClickInline(type) {
        switch (type) {
            case 'link':
                this.onClickLink();
                break;
            default:
                throw new Error("undefined inline type: " + type);
        }
    }

    /**
     * When a align button is clicked, toggle the align type.
     *
     * @param {String} type
     */
    public onClickAlign(alignment) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        let transform = state.transform();
        let newData = Data.create({ alignment: alignment });

        state = transform.setBlock({
            data: newData
        }).apply();

        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
    }

    /**
     * When a block button is clicked, toggle the block type.
     *
     * @param {String} type
     */
    public onClickBlock(type: string) {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;
        let transform = state.transform();
        const { document } = state;

        // Handle everything but list buttons.
        if (type != 'bulleted-list' && type != 'numbered-list') {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock('list-item');
            if (isList) {
                transform = transform
                    .setBlock({
                        type: isActive ? SlateReactComponent.DEFAULT_NODE : type
                    })
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list')
            }

            else {
                transform = transform
                    .setBlock({
                        type: isActive ? SlateReactComponent.DEFAULT_NODE : type
                    })
            }
        }

        // Handle the extra wrapping required for list buttons.
        else {
            const isList = this.hasBlock('list-item');
            const isType = state.blocks.some((block) => {
                return !!document.getClosest(block, parent => parent.type == type)
            });

            if (isList && isType) {
                transform = transform
                    .setBlock({
                        type: SlateReactComponent.DEFAULT_NODE
                    })
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list')
            } else if (isList) {
                transform = transform
                    .unwrapBlock(type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list')
                    .wrapBlock(type)
            } else {
                transform = transform
                    .setBlock({
                        type: 'list-item'
                    })
                    .wrapBlock(type)
            }
        }

        state = transform.apply();
        if (this.getMyself()) {
            this.getMyself().setState({ state });
        }
        else {
            this.setState({ state })
        }
    }

    /**
     * On paste, if the text is a link, wrap the selection in a link.
     *
     * @param {Event} e
     * @param {Object} data
     * @param {State} state
     */
    public onPaste(e, data, state) {
        if (state.isCollapsed) {
            return;
        }

        if (data.type != 'text' && data.type != 'html') {
            return;
        }

        let transform = state.transform();
        let { anchorOffset } = state.selection;

        return transform
            .wrapInline({
                type: 'link',
                data: {
                    href: data.text
                }
            })
            .moveToOffsets(anchorOffset, anchorOffset + data.text.length)
            .apply()
    }

    public onClickLink(): void {
        let { state } = this.getMyself() ? this.getMyself().state : this.state;

        if (!state.isExpanded) {
            return;
        }

        let { anchorOffset, focusOffset } = state.selection;

        const hasLink = this.hasInline('link');

        if (hasLink) {
            state = state
                .transform()
                .unwrapInline('link')
                .apply()
        }

        const hrefData = this.getMyself().state.getHrefData();

        state = state
            .transform()
            .wrapInline({
                type: 'link',
                data: hrefData
            })
            .moveToOffsets(anchorOffset, focusOffset)
            .apply();

        this.setState({ state })
    }

    /**
     * Render.
     *
     * @return {Element}
     */

    public render() {
        if (this.showToolbar) {
            return (
                <div>
                    {this.renderToolbar()}
                    {this.renderEditor()}
                </div>
            )
        } else {
            return (
                <div>
                    {this.renderEditor()}
                </div>
            )
        }
    }

    /**
     * Render the toolbar.
     *
     * @return {Element}
     */

    public renderToolbar() {
        return
        <div className="menu toolbar-menu">
            {this.renderMarkButton('bold', 'format_bold')}
            {this.renderMarkButton('italic', 'format_italic')}
            {this.renderMarkButton('underlined', 'format_underlined')}
            {this.renderInlineButton('link', 'link')}
            {this.renderBlockButton('code', 'code')}
            {this.renderBlockButton('heading-one', 'looks_one')}
            {this.renderBlockButton('heading-two', 'looks_two')}
            {this.renderBlockButton('heading-three', 'looks_3')}
            {this.renderBlockButton('heading-four', 'looks_4')}
            {this.renderBlockButton('heading-five', 'looks_5')}
            {this.renderBlockButton('heading-six', 'looks_6')}
            {this.renderBlockButton('block-quote', 'format_quote')}
            {this.renderBlockButton('numbered-list', 'format_list_numbered')}
            {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
            {this.renderAlignButton('align-left', 'format_align_left')}
            {this.renderAlignButton('align-center', 'format_align_center')}
            {this.renderAlignButton('align-right', 'format_align_right')}
            {this.renderAlignButton('align-justify', 'format_align_justify')}
        </div>
    }

    /**
     * Render a mark-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */
    public renderMarkButton(type, icon) {
        const isActive = this.hasMark(type);
        const onMouseDown = e => {
            e.preventDefault();
            this.onClickMark(type)
        }

        return (
            <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
                <span className="material-icons">{icon}</span>
            </span>
        )
    }

    /**
     * Render a block-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */

    public renderBlockButton(type, icon) {
        const isActive = this.hasBlock(type);
        const onMouseDown = e => {
            e.preventDefault();
            this.onClickBlock(type);
        }

        return (
            <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
                <span className="material-icons">{icon}</span>
            </span>
        )
    }

    /**
     * Render a align-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */
    public renderAlignButton(type, icon) {
        const isActive = this.hasBlock(type);
        const onMouseDown = e => {
            e.preventDefault();
            this.onClickAlign(type);
        }

        return (
            <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
                <span className="material-icons">{icon}</span>
            </span>
        )
    }

    /**
     * Render a inline-toggling toolbar button.
     *
     * @param {String} type
     * @param {String} icon
     * @return {Element}
     */
    public renderInlineButton(type, icon) {
        const isActive = this.hasInline(type);
        const onMouseDown = e => {
            e.preventDefault();
            this.onClickInline(type)
        }

        return (
            <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
                <span className="material-icons">{icon}</span>
            </span>
        )
    }

    /**
     * Render the Slate editor.
     *
     * @return {Element}
     */

    public renderEditor(): JSX.Element {
        let editor = <Editor
            placeholder={'Enter some rich text...'}
            state={this.state.state}
            schema={Utils.Configuration.Schema}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            onPaste={this.onPaste}
            readOnly={this.readOnly}
            onSelectionChange={this.onSelectionChange}
        />;

        return editor
    }
}



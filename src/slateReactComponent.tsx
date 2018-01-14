import * as React from "react";
import * as ReactDOM from "react-dom";
import * as injector from "react-frame-aware-selection-plugin";
import { Mark, Raw, Data, Value, Change } from "slate";
import { Editor } from "slate-react";
import { Set, Seq, Collection, List, Map } from "immutable";
import { initialState } from "./state";
import { IHyperlink } from "@paperbits/common/permalinks/IHyperlink";
import { SelectionState } from "@paperbits/common/editing/IHtmlEditor";
import { IBag } from "@paperbits/common/IBag";
import { isKeyHotkey } from 'is-hotkey'

injector();

export interface SlateReactComponentParameters{
    parentElement: HTMLElement,
    instanceSupplier: (SlateReactComponent) => void,
    intentionsMap: any
        /*renderToContainer = this.renderToContainer.bind(this);
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
        this.onClickLink = this.onClickLink.bind(this);*/
}

export class SlateReactComponent extends React.Component<any, any> {

    private isBoldHotkey = isKeyHotkey('mod+b')
    private isItalicHotkey = isKeyHotkey('mod+i')
    private isUnderlinedHotkey = isKeyHotkey('mod+u')
    private isCodeHotkey = isKeyHotkey('mod+`')

    private static dirtyHack;
    private static DEFAULT_NODE = "paragraph";
    private static DEFAULT_ALIGNMENT = "align-left";
    
    private intentionsMap = {};
    private reactElement = null;

    me = null;
    parentElement = null;
    showToolbar = false;

    state = {
        value: Value.fromJSON(initialState, { terse: true }),
        getHrefData: null,
        selectionChangeListeners: [],
        disabledListeners: [],
        enabledListeners: [],
        readOnly: true
    }

    constructor(props: SlateReactComponentParameters) {
        super(props);
        this.intentionsMap = props.intentionsMap;
        props.instanceSupplier(this);
        this.getMyself = this.getMyself.bind(this);
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
        this.state.value = Value.fromJSON(initialState, { terse: true });
    }

    public getMyself(): SlateReactComponent {
        return this;
    }

    public getState(): Object {
        const st = this.state.value.toJSON({ terse: true });
        return st.document;
    }

    public updateState(newState: any): void {
        var st = { document: { nodes: newState.nodes } };

        const value = Value.fromJSON(st, { terse: true });
        this.setState({value:value});
        this.forceUpdate();
    }

    public getSelectionPosition() {
        let value = this.getActualState();

        return {
            "anchorKey": value.selection.anchorKey,
            "anchorOffset": value.selection.anchorOffset,
            "focusKey": value.selection.focusKey,
            "focusOffset": value.selection.focusOffset,
        }
    }

    public setSelectionPosition(selectionPosition, focus) {
        let change: Change = this.getActualState().change();

        if (focus) {
            change = change.select(selectionPosition).focus();
        }
        else {
            change = change.select(selectionPosition);
        }

        this.applyChanges(change);
    }

    public addSelectionChangeListener(callback): void {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        selectionChangeListeners.push(callback);

        this.setState({ selectionChangeListeners: selectionChangeListeners });
        this.forceUpdate();
    }

    public removeSelectionChangeListener(callback): void {
        let selectionChangeListeners = this.state.selectionChangeListeners;

        for (let i = 0; i < selectionChangeListeners.length; i++) {
            if (selectionChangeListeners[i] === callback) {
                selectionChangeListeners.splice(i);
                break;
            }
        }
        this.setState({ selectionChangeListeners: selectionChangeListeners });
        this.forceUpdate();
    }

    public addDisabledListener(callback): void {
        let { disabledListeners } = this.state;

        disabledListeners.push(callback);

        this.setState({ disabledListeners: disabledListeners });
        this.forceUpdate();
    }

    public removeDisabledListener(callback): void {
        const disabledListeners = this.state.disabledListeners;

        for (let i = 0; i < disabledListeners.length; i++) {
            if (disabledListeners[i] === callback) {
                disabledListeners.splice(i);
                break;
            }
        }
        this.setState({ disabledListeners: disabledListeners });
        this.forceUpdate();
    }

    public addEnabledListener(callback): void {
        let { enabledListeners } = this.state;
        enabledListeners.push(callback);
        this.setState({ enabledListeners: enabledListeners });
        this.forceUpdate();
    }

    public removeEnabledListener(callback): void {
        let { enabledListeners } = this.state;
        for (let i = 0; i < enabledListeners.length; i++) {
            if (enabledListeners[i] === callback) {
                enabledListeners.splice(i);
                break;
            }
        }
        this.setState({ enabledListeners: enabledListeners });
        this.forceUpdate();
    }

    public notifyListeners(listeners): void {
        for (let i = 0; i < listeners.length; i++) {
            listeners[i]();
        }
    }

    public addOpenLinkEditorListener(callback): void {
        this.setState({ getHrefData: callback });
        this.forceUpdate();
    }

    public getSelectionState(): Value {
        const selectionState = {
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

        selectionState.ol = actualState.blocks.some((block) => {
            return !!document.getClosest(block.key, parent => parent.type === 'numbered-list')
        });

        selectionState.ul = actualState.blocks.some((block) => {
            return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
        });

        selectionState.normal = !(selectionState.h1 || selectionState.h2 || 
            selectionState.h3 || selectionState.h4 || selectionState.h4 || 
            selectionState.h5 || selectionState.h6 || selectionState.quote || 
            selectionState.code);

        return selectionState;
    }

    private getIntentions(): IBag<string[]> {
        const result = {};
        const value = this.getActualState();

        value.blocks.forEach(block => {
            const categories = block.data.get("categories");
            Object.assign(result, categories);
        });

        value.marks.forEach(mark => {
            const categories = mark.data.get("categories");
            Object.assign(result, categories);
        })

        return result;
    }

    public toggleBold(): void {
        this.toggleMark("bold");
    }

    public toggleItalic(): void {
        this.toggleMark("italic");
    }

    public toggleUnderlined(): void {
        this.toggleMark("underlined");
    }

    public toggleUl(): void {
        this.toggleBlock("bulleted-list");
    }

    public toggleOl(): void {
        this.toggleBlock("numbered-list");
    }

    public toggleH1(): void {
        this.toggleBlock("heading-one");
    }

    public toggleH2(): void {
        this.toggleBlock("heading-two");
    }

    public toggleH3(): void {
        this.toggleBlock("heading-three");
    }

    public toggleH4(): void {
        this.toggleBlock("heading-four");
    }

    public toggleH5(): void {
        this.toggleBlock("heading-five");
    }

    public toggleH6(): void {
        this.toggleBlock("heading-six");
    }

    public toggleQuote(): void {
        this.toggleBlock("block-quote");
    }

    public toggleCode(): void {
        this.toggleBlock("code");
    }

    public changeIntention(category: string, intentionFn: string | string[], type: string, scope: string): void {
        let nodes;
        let changeFn;
        let value: Value = this.getActualState();
        const expand = value.isExpanded;
        const selection = value.selection;

        switch (type) {
            case "inline":
                nodes = value.texts;
                changeFn = this.updateInlineCategory;
                break;
            case "block":
                nodes = value.blocks;
                changeFn = this.updateBlockCategory;
                break;
            default:
                throw new Error("Unexpected type value: " + type)
        }
        let change;

        nodes.forEach(function (node) {
            change = value.change().moveToRangeOf(node);

            if (change.value.selection.startKey == selection.startKey &&
                change.value.selection.startOffset < selection.startOffset ||
                change.value.selection.endKey == selection.endKey &&
                change.value.selection.endOffset > selection.endOffset) {

                const newSelection = {
                    anchorKey: change.value.selection.startKey,
                    anchorOffset: change.value.selection.startOffset,
                    focusKey: change.value.selection.endKey,
                    focusOffset: change.value.selection.endOffset
                }

                if (change.value.selection.startKey == selection.startKey && change.value.selection.startOffset < selection.startOffset) {
                    newSelection.anchorKey = selection.startKey
                    newSelection.anchorOffset = selection.startOffset
                }

                if (change.value.selection.endKey == selection.endKey && change.value.selection.endOffset > selection.endOffset) {
                    newSelection.focusKey = selection.endKey
                    newSelection.focusOffset = selection.endOffset
                }

                change = change.select(newSelection);
            }
            change = changeFn(change, node, category, intentionFn, scope);
        }, this);

        if (expand) {
            value = (change ? change : value.change())
                .select(selection)
                .focus();
        } else {
            value = (change ? change : value.change())
            .focus();
        }

        this.applyChanges(change);
    }
    
    public toggleIntention(category: string, intentionFn: string | string[], type: string): void {
        this.changeIntention(category, intentionFn, type, "intention");
    }
    
    public toggleCategory(category: string, intentionFn: string | string[], type: string): void {
        this.changeIntention(category, intentionFn, type, "category");
    }

    public updateInlineCategory(change, node, category: string, intentionFn: string | string[], scope: string) {
        let data;
        if (change.value.marks.some(m => m.type == "custom")) {
            change.value.marks.forEach(mark => {
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
                .removeMarkAtRange(change.value.selection, { type: "custom", data: data })
                .toggleMarkAtRange(change.value.selection, { type: "custom", data: newData });
        }
        else {
            change = change
                .toggleMarkAtRange(change.value.selection, { type: "custom", data: newData });
        }
        return change;
    }

    private updateCustomBlock(change, data, newData): Change {
        let block = change.value.blocks.find(_ => true);

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

        let value = this.getActualState();

        let change = value.change();

        value.blocks.forEach(block => {
            if (block.type == "custom") {
                change = change.unwrapBlock(block.type, block.data);
            }
        })

        value.marks.forEach(mark => {
            if (mark.type == "custom") {
                change = change.removeMark(mark);
            }
        })

        this.applyChanges(change);
    }

    public enable(): void {
        this.setState({readOnly: false});
        this.forceUpdate();
    }

    public disable(): void {
        this.setState({readOnly: false});
        this.clearSelection();
    }

    private getActualState(): Value {
        return this.state.value;
    }

    public clearSelection(): void {
        const value: Value = this.getActualState();
        const change = value.change().blur();

        this.applyChanges(change);
    }

    public getSelectionText(): string {
        const value = this.getActualState();
        return value.texts._tail.array.map(x => x.text).join("");
    }

    public expandSelection(): void {
        let value = this.getActualState();

        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            const change = value
                .change()
                .moveToRangeOf(linkNode)
                .focus();

            this.applyChanges(change);
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

        let value = this.getActualState();

        const change = value.change().select(newSelection);

        this.applyChanges(change);
    }

    public setHyperlink(hyperlink: IHyperlink): void {
        let value = this.getActualState();

        const hasLink = this.findInlineNode("link");

        const selection = value.selection;

        if (!selection.isExpanded) {
            return;
        }

        let change = value.change()

        if (hasLink) {
            change = change
                .unwrapInlineAtRange(selection, "link");

            value = change.value;
        }

        change = change
            .wrapInline(
            {
                type: "link",
                data: {
                    href: hyperlink.href,
                    target: hyperlink.target,
                    permalinkKey: hyperlink.permalinkKey
                }
            });

        value = change.value;

        const link = value.inlines.find(node => node.type == "link");

        if (link) {
            change = change
                .moveToRangeOf(link)
                .focus();
        }

        this.applyChanges(change);
    }

    public getHyperlink(): IHyperlink {
        let value = this.getActualState();
        const hasInline = this.findInlineNode("link");

        let link = value.inlines.find(node => node.type == "link");

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
        const value = this.getActualState();
        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            const change = value
                .change()
                .unwrapInline("link");

            this.applyChanges(change);
        }
    }

    /**
     * Check if the current selection has a mark with `type` in it.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private hasMark(type): boolean {
        let value = this.getActualState();
        return value.marks.some(mark => mark.type == type)
    }

    private getMarkData(type) {
        let value = this.getActualState();
        let mark = value.marks.first(function (e) {
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
        let value = this.getActualState();
        return value.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks have the same data.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private has(type): boolean {
        let value = this.getActualState();
        return value.blocks.some(node => node.type == type)
    }

    /**
     * Check if the any of the currently selected blocks has alignment of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private isAligned(type): boolean {
        let value = this.getActualState();
        return value.blocks.some(node => node.data.get("alignment") == type)
    }

    /**
     * Check if the any of the currently selected inlines are of `type`.
     *
     * @param {String} type
     * @return {Boolean}
     */
    private findInlineNode(type): any {
        const value : Value= this.getActualState();
        return value.inlines.find(node => node.type == type)
    }

    /**
     * On change, save the new value.
     *
     * @param {Change} change
     */
    public onChange(change: Change): void {
        
        this.setState({ value: change.value });

        if (change && 
            change.operations && 
            change.operations.length === 1 &&
            change.operations[0]["properties"] && 
            change.operations[0]["properties"].isFocused === false){
                return;
            }

        this.notifyListeners(this.state.selectionChangeListeners);
    }

    /**
     * On key down, if it"s a formatting command toggle a mark.
     *
     * @param {Event} e
     * @param {Object} data
     * @param {value} value
     * @return {value}
     */
    private onKeyDown(e, change) {
        let mark

        if (this.isBoldHotkey(event)) {
            mark = 'bold'
        } else if (this.isItalicHotkey(event)) {
            mark = 'italic'
        } else if (this.isUnderlinedHotkey(event)) {
            mark = 'underlined'
        } else {
            return
        }

        event.preventDefault()
        change.toggleMark(mark)
        return true;
    }

    public toggleMark(type: string): void {
        let value = this.getActualState();
        const expand = value.isExpanded;
        const selection = value.selection

        let change = value
            .change()
            .toggleMark(type);

        if (expand) {
            change = change
                .select(selection)
                .focus();
        }

        this.applyChanges(change);
    }

    private applyChanges(change){
        this.onChange(change);
        this.forceUpdate();
    }

    private toggleBlock(type: string): void {
        let value = this.getActualState();
        let change = value.change();

        const { document } = value;

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
            const isType = value.blocks.some((block) => {
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

        this.applyChanges(change);
    }

    public onClickLink(): void {
        let value: Value = this.getActualState().value;

        if (!value.selection.isExpanded) {
            return;
        }

        let { anchorOffset, focusOffset } = value.selection;

        const hasLink = this.findInlineNode("link");

        let change = value.change();
        if (hasLink) {
            change = value
                .change()
                .unwrapInline("link");
        }

        const hrefData = this.getMyself().state.getHrefData();

        change = 
            change
            .wrapInline({
                type: "link",
                data: hrefData
            })
            .moveToOffsets(anchorOffset, focusOffset);

        this.applyChanges(change);
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
            placeholder="Enter some rich text..."
            value={this.state.value}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            readOnly={this.state.value.readOnly}
            spellCheck={false}
            renderNode={this.renderNode}
            renderMark={this.renderMark}
        />;

        return editor
    }

    /**
     * Render a Slate node.
     *
     * @param {Object} props
     * @return {Element}
     */
  
    renderNode = (props) => {
        const {node} = props;
        switch (node.type) {
            case "block-quote": return this.createReactElement("blockquote", props)
            case "bulleted-list": return this.createReactElement("ul", props)
            case "heading-one": return this.createReactElement("h1", props)
            case "heading-two": return this.createReactElement("h2", props)
            case "heading-three": return this.createReactElement("h3", props)
            case "heading-four": return this.createReactElement("h4", props)
            case "heading-five": return this.createReactElement("h5", props)
            case "heading-six": return this.createReactElement("h6", props)
            case "list-item": return this.createReactElement("li", props)
            case "numbered-list": return this.createReactElement("ol", props)
            case "link": return this.createLinkElement(props)
            case "code": return this.createReactElement("pre", props)
            case "paragraph": return this.createReactElement("p", props)
            case "custom": return this.createReactElement("div", props)
        }
    }
  
    /**
     * Render a Slate mark.
     *
     * @param {Object} props
     * @return {Element}
     */
  
    renderMark = (props) => {
        const {mark} = props;
        switch (mark.type) {
            case "bold": return this.createReactElement("b", props)
            case "italic": return this.createReactElement("i", props)
            case "underlined": return this.createReactElement("u", props)
            case "custom": return this.createReactElement("span", props)
        }
    }

    private createReactElement(tagName, properties) {
        return this.createReactElementInternal(tagName, properties);
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
                        const intentionFunc = this.intentionsMap[intentionFns];
                        
                        if (!intentionFunc) {
                            console.warn(`Could not find intention with key ${intentionFns}`);
                            return "";
                        }
    
                        return intentionFunc();
                    }
                    let intentions: string[] = new Array<string>();
                    for (var i = 0; i < intentionFns.length; i++) {
                        const intentionFunc = this.intentionsMap[intentionFns[i]];
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

    private createLinkElement(properties) {
        const { data } = properties.node;
        const href = data.get("href");
        const target = data.get("target");

        Object.assign(properties.attributes, { href: href, target: target });

        return this.createReactElementInternal("a", properties);
    }

    private Configuration = {
        IntentionsMap: {}
    }
}
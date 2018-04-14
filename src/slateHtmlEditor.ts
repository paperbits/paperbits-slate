import "es6-shim";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SlateReactComponent, SlateReactComponentParameters } from "./slateReactComponent";
import { IEventManager } from "@paperbits/common/events";
import { IHyperlink, IPermalinkService } from "@paperbits/common/permalinks";
import { IHtmlEditor, SelectionState, HtmlEditorEvents } from "@paperbits/common/editing";
import { Intention } from "@paperbits/common/appearance/intention";
import { Mark, Raw, Data, Value, Change, Block } from "slate";
import * as Utils from "@paperbits/common";

export class SlateHtmlEditor implements IHtmlEditor {
    private readonly eventManager: IEventManager;
    private readonly permalinkService: IPermalinkService;
    private readonly intentions: any;
    private readonly selectionChangeListeners: Array<(htmlEditor: IHtmlEditor) => void> = new Array();
    private readonly listTypes = [];

    private slateReactComponent: SlateReactComponent;

    constructor(eventManager: IEventManager, intentionsProvider: any) {
        // initialization...
        this.eventManager = eventManager;

        this.intentions = intentionsProvider.getIntentions();

        // rebinding...
        this.getSelectionState = this.getSelectionState.bind(this);
        this.toggleBold = this.toggleBold.bind(this);
        this.toggleItalic = this.toggleItalic.bind(this);
        this.toggleUnderlined = this.toggleUnderlined.bind(this);
        this.toggleH1 = this.toggleH1.bind(this);
        this.toggleH2 = this.toggleH2.bind(this);
        this.toggleH3 = this.toggleH3.bind(this);
        this.toggleH4 = this.toggleH4.bind(this);
        this.toggleH5 = this.toggleH5.bind(this);
        this.toggleH6 = this.toggleH6.bind(this);
        this.toggleCode = this.toggleCode.bind(this);
        this.toggleQuote = this.toggleQuote.bind(this);
        this.getHyperlink = this.getHyperlink.bind(this);
        this.setHyperlink = this.setHyperlink.bind(this);
        this.removeHyperlink = this.removeHyperlink.bind(this);
        this.disable = this.disable.bind(this);
        this.attachToElement = this.attachToElement.bind(this);
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.setBlockIntention = this.setBlockIntention.bind(this);
        this.setInlineIntention = this.setInlineIntention.bind(this);
        this.toggleBlockIntention = this.toggleBlockIntention.bind(this);
        this.toggleInlineIntention = this.toggleInlineIntention.bind(this);
    }

    // Slate React Component Event Listeners
    private onSelectionChange(): void {
        this.selectionChangeListeners.forEach(listener => listener(this));
    }

    // public interface inmplementation

    public attachToElement(element: HTMLElement): void {
        try {
            const props: SlateReactComponentParameters = {
                parentElement: element,
                instanceSupplier: (slate: SlateReactComponent) => { this.slateReactComponent = slate; },
                intentions: this.intentions,
                selectionChangeListener: this.onSelectionChange
            }

            const reactElement = React.createElement(SlateReactComponent, props);

            this.slateReactComponent = ReactDOM.render(reactElement, element)
        }
        catch (error) {
            debugger;
        }
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
        const actualState = this.slateReactComponent.getCurrentState();
        const document: any = actualState.document;

        state.ol = actualState.blocks.some((block) => {
            return !!document.getClosest(block.key, parent => parent.type === 'numbered-list')
        });

        state.ul = actualState.blocks.some((block) => {
            return !!document.getClosest(block.key, parent => parent.type === 'bulleted-list')
        });

        state.normal = !state.h1 && !state.h2 && !state.h3 && !state.h4 && !state.h5 && !state.h6 && !state.code && !state.quote;

        return state;
    }

    public getState(): Object {
        let state = this.slateReactComponent.getState();
        return state;
    }

    public setState(state: Object): void {
        this.slateReactComponent.setComponentState(state);
    }

    public toggleBold(): void {
        this.toggleMark("bold");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleItalic(): void {
        this.toggleMark("italic");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleUnderlined(): void {
        this.toggleMark("underlined");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH1(): void {
        this.toggleBlock("heading-one");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH2(): void {
        this.toggleBlock("heading-two");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH3(): void {
        this.toggleBlock("heading-three");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH4(): void {
        this.toggleBlock("heading-four");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH5(): void {
        this.toggleBlock("heading-five");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleH6(): void {
        this.toggleBlock("heading-six");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public setHyperlink(data: IHyperlink): void {
        let value = this.slateReactComponent.getCurrentState();

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
                        href: data.href,
                        target: data.target,
                        permalinkKey: data.permalinkKey
                    }
                });

        value = change.value;

        const link = value.inlines.find(node => node.type == "link");

        if (link) {
            change = change
                .moveToRangeOf(link)
                .focus();
        }

        this.slateReactComponent.commit(change);
    }

    public getHyperlink(): IHyperlink {
        let value = this.slateReactComponent.getCurrentState();
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
        const value = this.slateReactComponent.getCurrentState();
        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            const change = value
                .change()
                .unwrapInline("link");

            this.slateReactComponent.commit(change);
        }
    }

    public toggleQuote(): void {
        this.toggleBlock("block-quote");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleCode(): void {
        this.toggleBlock("code");
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public toggleIntention(intention: Intention): void {
        let nodes;
        let changeFn: (change: Change, node: Node, intention: Intention) => void;
        let value: Value = this.slateReactComponent.getCurrentState();
        const expand = value.isExpanded;
        const selection = value.selection;

        switch (intention.scope) {
            case "inline":
                nodes = value.texts;
                changeFn = this.toggleInlineIntention;
                break;
            case "block":
                nodes = value.blocks;
                changeFn = this.toggleBlockIntention;
                break;
            default:
                throw new Error("Unexpected scope value: " + intention.scope)
        }

        let change;

        nodes.forEach((node) => {
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
            change = changeFn(change, node, intention);
        }, this);

        if (expand) {
            value = (change ? change : value.change())
                .select(selection)
                .focus();
        } else {
            value = (change ? change : value.change())
                .focus();
        }

        this.slateReactComponent.commit(change);
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public setIntention(intention: Intention): void {
        let nodes;
        let changeFn: (change: Change, node: Node, intention: Intention) => void;
        let value: Value = this.slateReactComponent.getCurrentState();
        const expand = value.isExpanded;
        const selection = value.selection;

        switch (intention.scope) {
            case "inline":
                nodes = value.texts;
                changeFn = this.setInlineIntention;
                break;
            case "block":
                nodes = value.blocks;
                changeFn = this.setBlockIntention;
                break;
            default:
                throw new Error("Unexpected scope value: " + intention.scope)
        }

        let change;

        nodes.forEach((node) => {
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
            change = changeFn(change, node, intention);
        }, this);

        if (expand) {
            value = (change ? change : value.change())
                .select(selection)
                .focus();
        } else {
            value = (change ? change : value.change())
                .focus();
        }

        this.slateReactComponent.commit(change);
        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public resetToNormal(): void {
        // TODO: Make it universal method to clear all blocks;

        this.hasBlock("heading-one") && this.toggleBlock("heading-one");
        this.hasBlock("heading-two") && this.toggleBlock("heading-two");
        this.hasBlock("heading-three") && this.toggleBlock("heading-three");
        this.hasBlock("heading-four") && this.toggleBlock("heading-four");
        this.hasBlock("heading-five") && this.toggleBlock("heading-five");
        this.hasBlock("heading-six") && this.toggleBlock("heading-six");
        this.hasBlock("block-quote") && this.toggleBlock("block-quote");
        this.hasBlock("code") && this.toggleBlock("code");

        const state = this.slateReactComponent.getCurrentState();

        let change = state.change();

        state.blocks.forEach(block => {
            if (block.type == "custom") {
                change = change.unwrapBlock(block.type, block.data);
            }
        })

        state.marks.forEach(mark => {
            if (mark.type == "custom") {
                change = change.removeMark(mark);
            }
        })

        this.slateReactComponent.commit(change);

        this.eventManager.dispatchEvent(HtmlEditorEvents.onSelectionChange);
    }

    public enable(): void {
        this.slateReactComponent.enable();
    }

    public disable(): void {
        this.slateReactComponent.disable();
    }

    public addSelectionChangeListener(callback: (htmlEditor: IHtmlEditor) => void): void {
        this.selectionChangeListeners.push(callback)
    }

    public removeSelectionChangeListener(callback: (htmlEditor: IHtmlEditor) => void): void {
        const listenerId = this.selectionChangeListeners.findIndex(l => l === callback);
        this.selectionChangeListeners.splice(listenerId, 1);
    }

    public setSelection(domSelection: Selection): void {
        if (!domSelection.anchorNode || !domSelection.focusNode) {
            return;
        }

        let anchorKey = domSelection.anchorNode.parentElement.parentElement.attributes.getNamedItem("data-key");
        let focusKey = domSelection.focusNode.parentElement.parentElement.attributes.getNamedItem("data-key");

        if (!anchorKey || !focusKey) {
            return;
        }

        let slateSelection = {
            anchorKey: anchorKey.value,
            anchorOffset: domSelection.anchorOffset,
            focusKey: focusKey.value,
            focusOffset: domSelection.focusOffset,
            isFocused: true
        }

        let value = this.slateReactComponent.getCurrentState();

        const change = value.change().select(slateSelection);

        this.slateReactComponent.commit(change);
    }

    public expandSelection(): void {
        let value = this.slateReactComponent.getCurrentState();

        const linkNode = this.findInlineNode("link");

        if (linkNode) {
            const change = value
                .change()
                .moveToRangeOf(linkNode)
                .focus();

            this.slateReactComponent.commit(change);
        }
    }

    public getSelectionText(): string {
        const value = this.slateReactComponent.getCurrentState();
        const startPos = value.selection.isBackward ? value.selection.focusOffset : value.selection.anchorOffset;
        const endPos = value.selection.isBackward ? value.selection.anchorOffset : value.selection.focusOffset;
        return value.texts._tail.array.map((x, i, a) => {
            const text: string = x.text;
            if (i === 0 && a.length === 1) {
                return text.substring(startPos, endPos);
            }
            if (i === 0) {
                return text.substring(startPos)
            }
            if (i === a.length) {
                text.substring(0, endPos);
            }
            return text;
        }).join("");
    }

    public setList(intention: Intention): void {
        const value = this.slateReactComponent.getCurrentState();
        let change = value.change();

        const { document } = value;
        const listPlugin = this.slateReactComponent.plugins.list;

        const list = listPlugin.utils.getCurrentList(value);
        const storedIntention: any = this.toStoredIntention(intention);

        if (list) {
            if (Utils.complementDeep(list.data.get("intentions"), true, storedIntention)) {
                //update list data
                const listProperties = { type: "list", data: { intentions: storedIntention } }
                change = change.setNodeByKey(list.key, listProperties)
            } else {
                // unwrap
                change = change.call(listPlugin.changes.unwrapList)
            }
        } else {
            //wrap
            change = change.call(listPlugin.changes.wrapInList, "list", { intentions: storedIntention })
        }

        this.slateReactComponent.commit(change);
    }

    public increaseIndent(): void {
        const value = this.slateReactComponent.getCurrentState();
        let change = value.change();

        const { document } = value;
        const listPlugin = this.slateReactComponent.plugins.list;

        const list = listPlugin.utils.getCurrentList(value);

        change = change.call(listPlugin.changes.increaseItemDepth)

        this.slateReactComponent.commit(change);
    }

    public decreaseIndent(): void {
        const value = this.slateReactComponent.getCurrentState();
        let change = value.change();

        const { document } = value;
        const listPlugin = this.slateReactComponent.plugins.list;

        const list = listPlugin.utils.getCurrentList(value);

        change = change.call(listPlugin.changes.decreaseItemDepth)

        this.slateReactComponent.commit(change);
    }

    private toggleInlineIntention(change, node, intention: Intention): void {
        let data;

        if (change.value.marks.some(m => m.type == "custom")) {
            change.value.marks.forEach(mark => {
                if (mark) {
                    data = mark.data
                }

                let newData = this.toggleIntentionInternal(data, intention);

                change = this.updateCustomMark(change, data, newData, mark);
            })
        }
        else {
            const newData = this.toggleIntentionInternal(null, intention);

            change = this.updateCustomMark(change, data, newData);
        }
        return change;
    }

    private toggleBlockIntention(change, node, intention: Intention) {
        const data = node.data;
        const newData = this.toggleIntentionInternal(data, intention);

        return this.updateCustomBlock(change, data, newData);
    }

    private setInlineIntention(change, node, intention: Intention): void {
        let data;

        if (change.value.marks.some(m => m.type == "custom")) {
            change.value.marks.forEach(mark => {
                if (mark) {
                    data = mark.data
                }

                let newData = this.setIntentionInternal(data, intention);

                change = this.updateCustomMark(change, data, newData, mark);
            })
        }
        else {
            const newData = this.setIntentionInternal(null, intention);

            change = this.updateCustomMark(change, data, newData);
        }

        return change;
    }

    private setBlockIntention(change, node, intention: Intention) {
        const data = node.data;
        const newData = this.setIntentionInternal(data, intention);

        return this.updateCustomBlock(change, data, newData);
    }

    private setIntentionInternal(data: Data, intention: Intention): Map<string, any> {
        const storedIntention: any = this.toStoredIntention(intention);

        if (!data) {
            if (!intention) {
                return null;
            }

            return Data.create({ intentions: storedIntention });
        }

        let storedIntentions = data.get("intentions");

        if (!storedIntentions) {
            return data.set("intentions", storedIntention);
        }

        if (Utils.getObjectAt(intention.groupId, storedIntentions, ".")) {
            storedIntentions = Utils.replace(intention.groupId, storedIntentions, {}, ".")
        }
        storedIntentions = Utils.mergeDeep(storedIntentions, storedIntention)

        return data.set("intentions", storedIntentions);
    }

    private toggleIntentionInternal(data: Data, intention: Intention): Map<string, any> {
        const storedIntention: any = this.toStoredIntention(intention);

        if (!data) {
            if (!intention) {
                return null;
            }

            return Data.create({ intentions: storedIntention });
        }

        let storedIntentions = data.get("intentions");

        if (!storedIntentions) {
            return data.set("intentions", storedIntention);
        }

        if (Utils.intersectDeep(storedIntentions, (t, s, k) => t[k] == s[k] ? t[k] : undefined, storedIntention)) {
            storedIntentions = Utils.complementDeep(storedIntentions, true, storedIntention);
        } else {
            if (Utils.getObjectAt(intention.groupId, storedIntentions, ".")) {
                storedIntentions = Utils.replace(intention.groupId, storedIntentions, {}, ".")
            }
            storedIntentions = Utils.mergeDeep(storedIntentions, storedIntention)
        }

        if (storedIntentions) {
            return data.set("intentions", storedIntentions);
        }
        else {
            return data.delete("intentions");
        }
    }

    private toStoredIntention(intention: Intention): any {
        const segments = intention.fullId.split(".");
        let result = {};
        const path = intention.fullId
        Utils.setStructure(path, result, ".")
        result = Utils.replace(path, result, intention.properties ? intention.properties : true, ".")
        return result;
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

    private toggleBlock(type: string): void {
        const value = this.slateReactComponent.getCurrentState();
        let change = value.change();

        value.blocks.forEach(block => {
            const newType = block.type == type ? "paragraph" : type;
            if (block.type == "list-item") {
                change = change
                    .setBlock(newType)
                    .wrapBlock("list-item")
            } else {
                change = change
                    .setBlock(newType)
            }
        });

        this.slateReactComponent.commit(change);
    }

    private toggleMark(type: string): void {
        let value = this.slateReactComponent.getCurrentState();
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

        this.slateReactComponent.commit(change);
    }

    private hasBlock(type): boolean {
        let value = this.slateReactComponent.getCurrentState();
        return value.blocks.some(node => node.type == type)
    }

    private hasMark(type): boolean {
        let value = this.slateReactComponent.getCurrentState();
        return value.marks.some(mark => mark.type == type)
    }

    private findInlineNode(type): any {
        const value: Value = this.slateReactComponent.getCurrentState();
        return value.inlines.find(node => node.type == type)
    }

    private getIntentions(): any {
        let result: any = {};
        const value = this.slateReactComponent.getCurrentState();

        value.blocks.forEach(block => {
            const storedIntentions = block.data.get("intentions");
            if (storedIntentions) {
                const intentions = this.findIntentions(storedIntentions);
                result = Utils.mergeDeep(result, intentions);
            }
        });

        value.marks.forEach(mark => {
            const storedIntentions = mark.data.get("intentions");
            if (storedIntentions) {
                const intentions = this.findIntentions(storedIntentions);
                result = Utils.mergeDeep(result, intentions);
            }
        })

        return result;
    }

    private findIntentions(intentionIds: any): any {

        const intentionSubtree = Utils.intersectDeep(this.intentions,
            (target: any, source: any, key: string) =>
                ({ [key]: target.get(key) }), intentionIds);

        return intentionSubtree;
    }
}
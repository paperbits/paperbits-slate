import * as React from "react";
import * as ReactDOM from "react-dom";
import * as injector from "react-frame-aware-selection-plugin";
import { Mark, Raw, Data, Value, Change } from "slate";
import { Editor } from "slate-react";
import { Set, Seq, Collection, List, Map } from "immutable";
import { initialState } from "./state";
import { IHyperlink } from "@paperbits/common/permalinks/IHyperlink";
import { SelectionState } from "@paperbits/common/editing";
import { Intention } from "@paperbits/common/appearance/Intention";
import * as Utils from "@paperbits/common/utils";
import { IBag } from "@paperbits/common/IBag";
import { isKeyHotkey } from 'is-hotkey'
import { intersectDeep } from "@paperbits/common/utils";
import * as editListPlugin from "slate-edit-list";

injector();

export interface SlateReactComponentState {
    value: any,
    getHrefData: any,
    readOnly: boolean
}

export interface SlateReactComponentParameters {
    parentElement: HTMLElement,
    instanceSupplier: (SlateReactComponent) => void,
    intentions: any,
    selectionChangeListener: () => void
}

export class SlateReactComponent extends React.Component<any, any> {
    private isBoldHotkey = isKeyHotkey('mod+b');
    private isItalicHotkey = isKeyHotkey('mod+i');
    private isUnderlinedHotkey = isKeyHotkey('mod+u');
    private isCodeHotkey = isKeyHotkey('mod+`');
    private intentions: any = {};
    private selectionChangeListener: () => void;

    state: SlateReactComponentState;

    private list = editListPlugin.default({
        types: ["list"],
        typeItem: "list-item",
        typeDefault: "paragraph"
    });
    
    public plugins = {
        list: this.list
    };

    private slatePlugins = [this.list];

    constructor(props: SlateReactComponentParameters) {
        super(props);

        this.intentions = props.intentions;
        props.instanceSupplier(this);
        this.selectionChangeListener = props.selectionChangeListener;
        this.getCurrentState = this.getCurrentState.bind(this);
        this.commit = this.commit.bind(this);
        this.setState = this.setState.bind(this);
        this.getState = this.getState.bind(this);
        this.enable = this.enable.bind(this);
        this.disable = this.disable.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.render = this.render.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.createReactElement = this.createReactElement.bind(this);
        this.state = {
            value: Value.fromJSON(initialState, { terse: true }),
            getHrefData: null,
            readOnly: true
        }
    }

    public getState(): Object {
        const st = this.state.value.toJSON({ terse: true });
        return st.document;
    }

    public setComponentState(newState: any): void {
        var st = { document: { nodes: newState.nodes } };

        const value = Value.fromJSON(st, { terse: true });
        this.setState({ value: value });
        this.forceUpdate();
    }

    public enable(): void {
        this.setState({ readOnly: false });
        this.forceUpdate();
    }

    public disable(): void {
        this.setState({ readOnly: true });
        const value: Value = this.getCurrentState();
        const change = value.change().blur();

        this.commit(change);
    }

    public getCurrentState(): Value {
        return this.state.value;
    }

    public commit(change) {
        this.onChange(change);
        this.forceUpdate();
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
            change.operations[0]["properties"].isFocused === false) {
            return;
        }

        this.selectionChangeListener();
    }

    /**
     * On key down, if it is a formatting command toggle a mark.
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

    public render(): JSX.Element {
        return this.renderEditor();
    }

    public renderEditor(): JSX.Element {
        let editor = <Editor
            placeholder="Enter some rich text..."
            value={this.state.value}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            readOnly={this.state.readOnly}
            spellCheck={false}
            renderNode={this.renderNode}
            renderMark={this.renderMark}
            plugins={this.slatePlugins}
        />;

        return editor
    }

    renderNode = (props) => {
        const { node } = props;
        switch (node.type) {
            case "block-quote": return this.createReactElement("blockquote", props)
            case "list": return this.createListElement(props)
            case "heading-one": return this.createReactElement("h1", props)
            case "heading-two": return this.createReactElement("h2", props)
            case "heading-three": return this.createReactElement("h3", props)
            case "heading-four": return this.createReactElement("h4", props)
            case "heading-five": return this.createReactElement("h5", props)
            case "heading-six": return this.createReactElement("h6", props)
            case "list-item": return this.createReactElement("li", props)
            case "link": return this.createLinkElement(props)
            case "code": return this.createReactElement("pre", props)
            case "paragraph": return this.createReactElement("p", props)
            case "custom": return this.createReactElement("div", props)
        }
    }

    renderMark = (props) => {
        const { mark } = props;
        switch (mark.type) {
            case "bold": return this.createReactElement("b", props)
            case "italic": return this.createReactElement("i", props)
            case "underlined": return this.createReactElement("u", props)
            case "custom": return this.createReactElement("span", props)
        }
    }

    private createReactElement(tagName: string, properties: any): JSX.Element {
        const data = properties.mark ? properties.mark.data : properties.node.data;
        let storedIntentions = data.get("intentions");

        if (!storedIntentions) {
            return React.createElement(tagName, properties.attributes, properties.children);
        }

        const attributes = properties.attributes || {};

        // TODO: Make universal!!!
        const intentionSubtree: any = this.findIntentions(storedIntentions);
        const intentions: Intention[] = Utils.leaves(intentionSubtree);

        if (intentions.length > 0) {
            const className = intentions.map(intention => intention.params()).join(" ");

            Object.assign(attributes, { className: className });
        }

        // TODO: Switch to node.data
        const anchorIntentionKey = Object.keys(intentions).find(x => x === "anchorId");

        if (anchorIntentionKey) {
            const id = intentions[anchorIntentionKey];

            Object.assign(attributes, { id: id });
        }

        return React.createElement(tagName, attributes, properties.children);
    }

    private createLinkElement(properties) {
        const { data } = properties.node;
        const href = data.get("href");
        const target = data.get("target");

        Object.assign(properties.attributes, { href: href, target: target });

        return this.createReactElement("a", properties);
    }

    private createListElement(properties) {
        const { data } = properties.node;
        const storedIntentions = data.get("intentions");

        const isUnorderedList = !!Utils.getObjectAt("container/list/unordered", storedIntentions);

        if (isUnorderedList){
            return this.createReactElement("ul", properties);
        }

        const intentions = Utils.leaves(this.findIntentions(storedIntentions));

        if (intentions.length > 0){
            const intention = intentions[0];
            if (intention.fullId.startsWith(this.intentions.container.list.ordered.name))
            {
                let start = null;
                
                // if start number set explicitl - use this value
                if (intention.properties && intention.properties.start){
                    start = intention.properties.start;
                }

                // if start set implicitly - calculate the start number based on previous siblings
                if (intention.properties && intention.properties.continue){
                    start = 1;
                    let sibling = properties.node.getPreviousSibling();
                    while(sibling != null){
                        if (sibling.type === "list"){
                            start += sibling.filterDescendants(d => d.getParent(d.key) == sibling).size;
                        }
                    }
                }

                // if start number was set either way - use it 
                if (start){
                    properties.attributes = properties.attributes || {}; 
                    Object.assign(properties.attributes, { start: intention.properties.start });
                }
            }
        }

        return this.createReactElement("ol", properties);
    }

    private findIntentions(storedIntentions: any): any {

        const intentionSubtree = Utils.intersectDeep(
            this.intentions,
            (target: any, source: any, key: string) => target[key], 
            storedIntentions);

        return intentionSubtree;
    }
}
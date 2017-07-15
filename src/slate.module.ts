import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { SlateHtmlEditor } from "./slateHtmlEditor";


export class SlateModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("htmlEditor", SlateHtmlEditor);
    }
}
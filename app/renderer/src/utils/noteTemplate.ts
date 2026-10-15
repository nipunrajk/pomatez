/**
 * A small Mustache-style template engine for exported notes.
 *
 *   {{name}}              value (missing → empty)
 *   {{name|yaml}}         value as a quoted YAML string
 *   {{#name}}…{{/name}}   list: repeat per item; value: show if truthy
 *   {{^name}}…{{/name}}   show if missing, false or an empty list
 *
 * Inside a list, names resolve on the item first, then outward. A line
 * holding only a section tag is dropped, so templates stay readable.
 */
export type TemplateValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | TemplateView
  | TemplateView[];

export type TemplateView = { [key: string]: TemplateValue };

const FILTERS: Record<string, (s: string) => string> = {
  yaml: (s) => JSON.stringify(s),
};

const STANDALONE = /^[ \t]*(\{\{[#^/][^}]*\}\})[ \t]*\r?\n/gm;
const TOKEN = /\{\{\s*([#^/]?)\s*([\w.]+)(?:\s*\|\s*(\w+))?\s*\}\}/g;

type Node =
  | { kind: "text"; text: string }
  | { kind: "var"; name: string; filter?: string }
  | { kind: "section"; name: string; inverted: boolean; children: Node[] };

const parse = (template: string): Node[] => {
  const source = template.replace(STANDALONE, "$1");
  const root: Node[] = [];
  const stack: { name: string; children: Node[] }[] = [
    { name: "", children: root },
  ];
  let last = 0;
  TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN.exec(source))) {
    const top = stack[stack.length - 1];
    if (match.index > last) {
      top.children.push({
        kind: "text",
        text: source.slice(last, match.index),
      });
    }
    last = TOKEN.lastIndex;
    const [, sigil, name, filter] = match;
    if (sigil === "#" || sigil === "^") {
      const section: Node = {
        kind: "section",
        name,
        inverted: sigil === "^",
        children: [],
      };
      top.children.push(section);
      stack.push({ name, children: section.children });
    } else if (sigil === "/") {
      // A stray or mismatched close tag is kept as text, not an error.
      if (stack.length > 1 && top.name === name) stack.pop();
      else top.children.push({ kind: "text", text: match[0] });
    } else {
      top.children.push({ kind: "var", name, filter });
    }
  }
  if (last < source.length) {
    stack[stack.length - 1].children.push({
      kind: "text",
      text: source.slice(last),
    });
  }
  return root;
};

const lookup = (contexts: TemplateView[], name: string): TemplateValue => {
  const [head, ...rest] = name.split(".");
  for (let i = contexts.length - 1; i >= 0; i--) {
    // Own keys only, so {{constructor}} and friends stay empty.
    if (Object.prototype.hasOwnProperty.call(contexts[i], head)) {
      let value: TemplateValue = contexts[i][head];
      for (const part of rest) {
        value =
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          Object.prototype.hasOwnProperty.call(value, part)
            ? value[part]
            : undefined;
      }
      return value;
    }
  }
  return undefined;
};

const isEmpty = (value: TemplateValue) =>
  value === undefined ||
  value === null ||
  value === false ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const render = (nodes: Node[], contexts: TemplateView[]): string =>
  nodes
    .map((node) => {
      if (node.kind === "text") return node.text;
      const value = lookup(contexts, node.name);
      if (node.kind === "var") {
        if (value === undefined || value === null) return "";
        if (typeof value === "object") return "";
        const text = String(value);
        const filter = node.filter && FILTERS[node.filter];
        return filter ? filter(text) : text;
      }
      if (node.inverted) {
        return isEmpty(value) ? render(node.children, contexts) : "";
      }
      if (isEmpty(value)) return "";
      if (Array.isArray(value)) {
        return value
          .map((item) => render(node.children, [...contexts, item]))
          .join("");
      }
      if (typeof value === "object" && value !== null) {
        return render(node.children, [...contexts, value]);
      }
      return render(node.children, contexts);
    })
    .join("");

export const renderTemplate = (template: string, view: TemplateView) =>
  render(parse(template), [view]);

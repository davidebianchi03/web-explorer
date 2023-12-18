export type ChildItem = {
    key: number,
    name: string,
    is_folder: boolean,
    abs_path: string,
    parent: string,
    permissions: number,
    modified_on: Date,
    editable: boolean,
    children: ChildItem[]
}
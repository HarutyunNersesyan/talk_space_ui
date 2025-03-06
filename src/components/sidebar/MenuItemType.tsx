interface MenuItemType {
    type: 'item' | 'section-title' | 'collapsible';
    text?: string;
    to?: string;
    title?: string;
    items?: { text: string; to: string }[];
}

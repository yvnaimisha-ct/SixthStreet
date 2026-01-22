export interface ExpectedFieldSchema {
  id: string;
  type: string;
  required: boolean;
  linkType?: string;
  items?: {
    type: string;
    validations?: {
      regexp?: string;
      linkContentType?: string[];
    };
  };
  validations?: {
    regexp?: string;
    linkContentType?: string[];
  };
}

export interface ExpectedContentTypeSchema {
  id: string;
  name: string;
  displayField: string;
  description: string;
  fields: ExpectedFieldSchema[];
}

/* ---- Contentful actual types (minimal, not full SDK) ---- */

export interface ContentfulField {
  id: string;
  type: string;
  required: boolean;
  linkType?: string;
  validations?: any[];
  items?: {
    type: string;
    validations?: any[];
  };
}

export interface ContentfulContentType {
  id: string;
  name: string;
  displayField: string;
  description: string;
  fields: ContentfulField[];
}

export type BrandedString<Brand extends string> = string & { readonly __brand: Brand };

type SerializeTypeOptions = {
  is: (value: any) => boolean;
  serialize: (value: any) => any;
  deserialize: (value: any) => any;
};

const custom_types: { [name: string]: SerializeTypeOptions } = {};

export function addSerializeType(name: string, options: SerializeTypeOptions) {
  custom_types[name] = options;
}

export function serialize(data: any): string {
  return JSON.stringify(serializerVisitor(data));
}

export function deserialize(serialized: string): any {
  return deserializerVisitor(JSON.parse(serialized));
}

function serializerVisitor(data: any): any {
  const custom = Object.keys(custom_types).find((key) =>
    custom_types[key].is(data)
  );

  return !!custom
    ? { $dataType: custom, value: custom_types[custom].serialize(data) }
    : typeof data !== "object" || !data
    ? data
    : visitEachProperty(data, (_, value) => serializerVisitor(value));
}

function deserializerVisitor(data: any): any {
  const custom =
    typeof data === "object" &&
    !!data &&
    "$dataType" in data &&
    custom_types[data.$dataType];

  return custom
    ? custom.deserialize(data.value)
    : typeof data !== "object" || !data
    ? data
    : visitEachProperty(data, (_, value) => deserializerVisitor(value));
}

function visitEachProperty(
  data: Object,
  visitor: (key: string | number, value: any) => any
) {
  return data instanceof Array
    ? data.map((v, index) => visitor(index, v))
    : Object.keys(data).reduce((next, key) => {
        next[key] = visitor(key, (data as any)[key]);

        return next;
      }, {} as any);
}

addSerializeType("date", {
  is: (v) => v instanceof Date,
  serialize: (v: Date) => v.getTime(),
  deserialize: (v: number) => new Date(v),
});

import React from 'react';
import {
  PathFormPath,
  PathFormPublishOptions,
  PathFormStoreMeta,
  PathFormValidation,
  toDotPath,
  usePathForm,
  usePathFormDotPath,
  usePathFormValue,
} from '.';

export interface PathFormInputProps {
  name: string;
  value: any;
  onChange: (event?: any, value?: any) => any;
  onBlur: (event?: any) => any;
}

export interface PathFormFieldRenderProps {
  inputProps: PathFormInputProps;
  meta: PathFormStoreMeta;
  renders: number;
}

export interface PathFormFieldProps {
  path: PathFormPath;
  defaultValue: any; // TODO generics?
  render: (props: PathFormFieldRenderProps) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
  renderEmpty?: (props: PathFormFieldRenderProps) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
  validations?: Array<PathFormValidation>;
  publish?: PathFormPublishOptions;
}

export const PathFormField: React.FC<PathFormFieldProps> = ({ path, render, defaultValue, validations, publish }) => {
  const name = usePathFormDotPath(path);
  const [value, meta, renders] = usePathFormValue(path, defaultValue); // TODO defaultValue needed?
  const { setValue, setMeta, clearError, watchers, state } = usePathForm();

  const onChange = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const value = event?.target?.value ?? event;
      setValue(path, value);
      // setMeta(path, { dirty: true });

      if (publish?.path) {
        // TODO this value is wrong and should just be publish(publish?.path) -- if no value given, get the store value as-is
        watchers.current.emit(toDotPath(publish?.path), value);
      }
    },
    // ignore `watchers`
    // ignore `publish` TODO eventually this should be serialized
    // eslint-disable-next-line
    [path, setValue, setMeta]
  );

  // TODO onBlur, ref
  const onBlur = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const blurValue = event?.target?.value ?? event;

      // if the field has an error, and our blur value is different than the error value, clear the error
      if (Boolean(meta?.error) && blurValue !== meta?.error?.value && state.current.mode !== 'onChange') {
        clearError(path);
      }

      if (meta.touched !== true) {
        setMeta(path, { touched: true });
      }
    },
    [path, clearError, setMeta, meta, state.current.mode]
  );

  // TODO reusable hook for usePathFormValidation -> useEffect [validations]
  React.useEffect(() => {
    // TODO handle multiple fields for same path
    if (validations) {
      setMeta(path, { validations });
    }
  }, [setMeta, validations]);

  return render({
    inputProps: {
      name,
      value,
      onChange,
      onBlur,
    },
    meta,
    renders,
  });
};

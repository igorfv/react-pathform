import React from 'react';
import { getByLabelText, getByTestId, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PathFormProvider } from './usePathForm';
import { PathFormField } from './PathFormField';
import { PathForm } from './PathForm';
import { PathFormValidation } from './usePathForm';

const TestWrapper: React.FC = ({ children }) => {
  return (
    <PathFormProvider initialRenderValues={{ nested: { items: [{ name: 'Joey Joe Joe Jr. Shabadoo' }] } }}>
      <PathForm onSubmit={() => null}>
        {children}
        <button type="submit" data-testid="submit">
          Submit
        </button>
      </PathForm>
    </PathFormProvider>
  );
};

describe('PathFormField', () => {
  let container: HTMLElement;

  describe('base', () => {
    beforeEach(() => {
      ({ container } = render(
        <PathFormField
          path={['nested', 'items', 0, 'name']}
          defaultValue="default"
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...inputProps} />
                <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper }
      ));
    });

    it('renders with the value from the store', async () => {
      expect(getByTestId(container, 'meta')).toMatchSnapshot();
      expect(getByLabelText(container, 'Name')).toHaveDisplayValue('Joey Joe Joe Jr. Shabadoo');
      expect(getByTestId(container, 'renders')).toMatchSnapshot();
    });

    it('user can type and modify the value in the store', async () => {
      userEvent.click(getByLabelText(container, 'Name'));
      userEvent.type(getByLabelText(container, 'Name'), ' new text');

      // new text appended
      expect(getByLabelText(container, 'Name')).toHaveDisplayValue(/ new text$/);

      // rendered 9 times due to typing 9 characters
      expect(getByTestId(container, 'renders')).toHaveTextContent('9');
    });
  });

  describe('dynamic validation', () => {
    it('the error should change when the validation is replaced', async () => {
      const DynamicValidation = () => {
        const [a, setA] = React.useState(false);

        let validations: PathFormValidation[] = [{ type: 'required', message: 'required' }];
        if (a) validations = [];

        return (
          <>
            <PathFormField
              path={['nested', 'items', 0, 'name']}
              defaultValue="default"
              validations={validations}
              render={({ inputProps, meta, renders }) => {
                return (
                  <div>
                    <label htmlFor="name">Name</label>
                    <input id="name" {...inputProps} />
                    <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                    <pre data-testid="renders">{JSON.stringify(renders)}</pre>
                  </div>
                );
              }}
            />
            <button type="button" onClick={() => setA((value) => !value)} data-testid="toggle">
              Toggle
            </button>
          </>
        );
      };

      const { container } = render(<DynamicValidation />, { wrapper: TestWrapper });

      userEvent.clear(getByLabelText(container, 'Name'));
      userEvent.click(getByTestId(container, 'submit'));

      // Should have an error
      expect(getByTestId(container, 'meta')).toMatchSnapshot();

      userEvent.click(getByTestId(container, 'toggle'));
      userEvent.click(getByTestId(container, 'submit'));

      // Should have no error since there's no validation anymore
      expect(getByTestId(container, 'meta')).toMatchSnapshot();
    });
  });

  describe('onSubmit validations', () => {
    it('adds an error when custom validation returns false', async () => {
      const { container } = render(
        <PathFormField
          path={['nested', 'items', 0, 'name']}
          defaultValue="default"
          validations={[
            {
              type: 'custom',
              message: 'Not a real name',
              value: (value: string) => {
                // asdasdasd is not a real name, returns false if the name contains it
                return value.indexOf('asdasdasd') === -1;
              },
            },
          ]}
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...inputProps} />
                <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper }
      );

      userEvent.click(getByLabelText(container, 'Name'));
      userEvent.type(getByLabelText(container, 'Name'), ' asdasdasd');

      userEvent.click(getByTestId(container, 'submit'));

      expect(getByTestId(container, 'meta')).toMatchSnapshot();
    });

    it('adds an error when another value on the store is invalid', async () => {
      const { container } = render(
        <PathFormField
          path={['nested', 'items', 0, 'name']}
          defaultValue="default"
          validations={[
            {
              type: 'custom',
              message: 'Some other item is invalid',
              value: (_value, store) => {
                return store.someToggle;
              },
            },
          ]}
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...inputProps} />
                <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />,
        { wrapper: TestWrapper }
      );

      userEvent.click(getByLabelText(container, 'Name'));
      userEvent.type(getByLabelText(container, 'Name'), ' asdasdasd');

      userEvent.click(getByTestId(container, 'submit'));

      expect(getByTestId(container, 'meta')).toMatchSnapshot();
    });
  });

  describe('onChange validations', () => {
    const TestWrapperOnChange: React.FC = ({ children }) => {
      return (
        <PathFormProvider initialRenderValues={{ nested: { items: [{ name: 'Joey Joe Joe Jr. Shabadoo' }] } }} mode="onChange">
          <PathForm onSubmit={() => null}>
            {children}
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </PathForm>
        </PathFormProvider>
      );
    };

    it('adds an error when custom validation returns false', async () => {
      const { container } = render(
        <PathFormField
          path={['nested', 'items', 0, 'name']}
          defaultValue="default"
          validations={[
            {
              type: 'custom',
              message: 'Not a real name',
              value: (value: string) => {
                // asdasdasd is not a real name, returns false if the name contains it
                return value.indexOf('asdasdasd') === -1;
              },
            },
          ]}
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...inputProps} />
                <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />,
        { wrapper: TestWrapperOnChange }
      );

      userEvent.click(getByLabelText(container, 'Name'));
      userEvent.type(getByLabelText(container, 'Name'), ' asdasdasd');

      expect(getByTestId(container, 'meta')).toMatchSnapshot();
    });

    it('adds an error when another value on the store is invalid', async () => {
      const { container } = render(
        <PathFormField
          path={['nested', 'items', 0, 'name']}
          defaultValue="default"
          validations={[
            {
              type: 'custom',
              message: 'Some other item is invalid',
              value: (_value, store) => {
                return store.someToggle;
              },
            },
          ]}
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...inputProps} />
                <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />,
        { wrapper: TestWrapperOnChange }
      );

      userEvent.click(getByLabelText(container, 'Name'));
      userEvent.type(getByLabelText(container, 'Name'), ' asdasdasd');

      expect(getByTestId(container, 'meta')).toMatchSnapshot();
    });

    it("clears the error when it's fixed", async () => {
      const { container } = render(
        <PathFormField
          path={['nested', 'items', 0, 'name']}
          defaultValue="default"
          validations={[{ type: 'required', message: 'Field is required' }]}
          render={({ inputProps, meta, renders }) => {
            return (
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" {...inputProps} />
                <pre data-testid="meta">{JSON.stringify(meta)}</pre>
                <pre data-testid="renders">{JSON.stringify(renders)}</pre>
              </div>
            );
          }}
        />,
        { wrapper: TestWrapperOnChange }
      );

      userEvent.click(getByLabelText(container, 'Name'));
      userEvent.clear(getByLabelText(container, 'Name'));

      // Expect error
      expect(getByTestId(container, 'meta')).toMatchSnapshot();

      userEvent.type(getByLabelText(container, 'Name'), 'Joe');

      // Expect no error
      expect(getByTestId(container, 'meta')).toMatchSnapshot();
    });
  });
});

import React, { useState } from 'react';
import { Link } from '@reach/router';
import * as yup from 'yup';
import { Button, Form, Header, Segment } from 'semantic-ui-react';
import { FormContainer, FormWrapper } from '../styles/Form';
import Errors from '../Errors';
import { useAppState } from '../../contexts/app-context';
import { register } from '../../API/AuthAPI';
import { validateForm } from '../../utils';

function SignUp() {
  const [form, setValues] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState(null);

  const { dispatch } = useAppState();

  const handleChange = (e) => {
    setValues({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = await validateForm(form, SignUpSchema);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    try {
      await register(form);
      dispatch({ type: 'LOGIN' });
    } catch (err) {
      const { data } = err.response;
      setErrors([data]);
    }
  };

  return (
    <FormContainer>
      <FormWrapper>
        <Header as="h2" color="blue">
          Create a new account
        </Header>
        <Form autoComplete="off" onSubmit={handleSubmit}>
          <Segment stacked>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              name="username"
              value={form.username}
              placeholder="Username"
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="mail"
              iconPosition="left"
              name="email"
              type="email"
              value={form.email}
              placeholder="E-mail address"
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              name="password"
              value={form.password}
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
            <Button color="blue" fluid size="large">
              Sign up
            </Button>
          </Segment>
        </Form>
        {errors && <Errors errors={errors} />}
        <Segment secondary>
          Already have an account? &nbsp;<Link to="/">Sign in</Link>
        </Segment>
      </FormWrapper>
    </FormContainer>
  );
}

const SignUpSchema = yup.object().shape({
  username: yup
    .string()
    .min(2)
    .max(50)
    .required(),
  email: yup
    .string()
    .email()
    .required(),
  password: yup
    .string()
    .min(5)
    .max(255)
    .required(),
});

export default SignUp;

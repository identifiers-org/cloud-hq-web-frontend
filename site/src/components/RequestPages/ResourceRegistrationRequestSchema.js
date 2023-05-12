import { addMethod, object, string, ref, Schema, bool } from 'yup';
import validators from "../../utils/validators";

addMethod(Schema, 'validateResourceRequestWithRegistryEndpoint', function() {
  return this.test('validateResourceRequestWithRegistryEndpoint', "Rejected by endpoint",
    async function(value, textContext) {
      if (value) {
        let attributeToValidate, otherValues;
        if (this.path in validators) {
          attributeToValidate = this.path;
          otherValues = this.parent;
        } else {
          attributeToValidate = textContext.options.context.attr;
          otherValues = textContext.options.context.otherValues;
        }
        try {
          const response = await validators[attributeToValidate](value, otherValues, "resource");
          return response.valid ? true : this.createError({message: response.errorMessage})
        } catch (e) {
          console.error(this, e)
          return false;
        }
      } else {
        return true
      }
    }
  )
})


const ResourceRegistrationRequestSchema = object({
  namespacePrefix: string().label("Prefix")
    .required().trim().validateResourceRequestWithRegistryEndpoint(),
  sampleId: string().label("Sample ID")
    .required().trim().validateResourceRequestWithRegistryEndpoint(),

  institutionName: string().label("Institution name")
    .required().trim().validateResourceRequestWithRegistryEndpoint(),
  institutionDescription: string().label("Institution description")
    .required().min(50).validateResourceRequestWithRegistryEndpoint(),
  institutionHomeUrl: string().label("Institution home URL")
    .required().trim().url()
    .matches(/^http/, "Must be a http(s) URL")
    .validateResourceRequestWithRegistryEndpoint(),
  institutionLocation: string().label("Institution location")
    .required().trim().validateResourceRequestWithRegistryEndpoint(),
  institutionRorId: string().label("Instituton ROR ID")
    .notRequired().trim().url()
    .matches(/^https:\/\/ror.org\/0[a-z|0-9]{6}[0-9]{2}$/,
      "Please input the whole https URL, ex: https://ror.org/02catss52"),

  providerName: string().label("Provider Name")
    .required().trim().validateResourceRequestWithRegistryEndpoint(),
  providerDescription: string().label("Provider description")
    .required().validateResourceRequestWithRegistryEndpoint(),
  providerHomeUrl: string().label("Provider home URL")
    .required().trim().url()
    .matches(/^http/, "Must be a http(s) URL")
    .validateResourceRequestWithRegistryEndpoint(),
  providerCode: string().label("Provider code")
    .notRequired().trim().validateResourceRequestWithRegistryEndpoint(),
  providerLocation: string().label("Provider location")
    .required().trim().validateResourceRequestWithRegistryEndpoint(),
  providerUrlPattern: string().label("Provider URL pattern")
    .required().trim()
    .matches(/^http.+\{\$id\}/,
      "Pattern must be a http(s) URL that contains the {$id} placeholder")
    .validateResourceRequestWithRegistryEndpoint(),
  protectedUrls: bool().label("Has protected URLs").default(false),
  authHelpUrl: string().label("Authentication details URL").trim().url()
    .when("protectedUrls", { is: true,
      then: schema => schema.required().validatePrefixRequestWithRegistryEndpoint(),
      otherwise: schema => schema.transform(() => null) // TODO - check why this transform doesn't work with formik
    }),
  authHelpDescription: string().label("Authentication description").trim()
    .when("protectedUrls", { is: true,
      then: schema => schema.required().min(50).validatePrefixRequestWithRegistryEndpoint(),
      otherwise: schema => schema.transform(() => null) // TODO - check why this transform doesn't work with formik
    }),

  requester: object({
    email: ref('requester.email'),
    name: ref('requester.name')
  }),
  requesterEmail: string().label("Requester e-mail")
    .required().trim().email().validateResourceRequestWithRegistryEndpoint(),
  requesterName: string().label("Requester name")
    .required().trim().validateResourceRequestWithRegistryEndpoint()
});

export default ResourceRegistrationRequestSchema;

export const ResourceRequestInitialValues = {
  namespacePrefix: "",
  sampleId: "",

  institutionName: "",
  institutionDescription:"",
  institutionHomeUrl: "",
  institutionLocation: "",
  institutionRorId: "",

  providerName: "",
  providerDescription: "",
  providerHomeUrl: "",
  providerCode: "",
  providerLocation: "",
  providerUrlPattern: "",

  requester: {
    email: "",
    name: ""
  },
  requesterName: "",
  requesterEmail: ""
}


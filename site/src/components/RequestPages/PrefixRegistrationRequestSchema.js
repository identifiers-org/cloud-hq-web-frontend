import {addMethod, object, string, ref, Schema} from 'yup';
import validators from "../../utils/validators";

addMethod(Schema, 'validatePrefixRequestWithRegistryEndpoint', function() {
  return this.test('validatePrefixRequestWithRegistryEndpoint', "Rejected by endpoint",
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
          const response = await validators[attributeToValidate](value, otherValues, "prefix");
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

const isRegexValid = async (value) => {
  try { new RegExp(value); }
  catch { return false; }
  return true;
}

const PrefixRegistrationRequestSchema = object({
  name: string().label("Name")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  description: string().label("Description")
    .required().min(50).validatePrefixRequestWithRegistryEndpoint(),
  additionalInformation: string().label("Additional information")
    .notRequired().validatePrefixRequestWithRegistryEndpoint(),
  supportingReferences: string().label("Supporting references")
    .notRequired().validatePrefixRequestWithRegistryEndpoint(),

  requestedPrefix: string().label("Requested prefix")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  sampleId: string().label("Sample ID")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  idRegexPattern: string().label("LUI pattern")
    .required().trim()
    .test('valid regex',({value}) => `"${value}" is not a valid regex`, isRegexValid)
    .validatePrefixRequestWithRegistryEndpoint(),

  institutionName: string().label("Institution name")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  institutionDescription: string().label("Institution description")
    .required().min(50).validatePrefixRequestWithRegistryEndpoint(),
  institutionHomeUrl: string().label("Institution home URL")
    .required().trim().url()
    .matches(/^http/, "Must be a http(s) URL")
    .validatePrefixRequestWithRegistryEndpoint(),
  institutionLocation: string().label("Institution location")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  institutionRorId: string().label("Instituton ROR ID")
    .notRequired().trim().url()
    .matches(/^https:\/\/ror.org\/0[a-z|0-9]{6}[0-9]{2}$/,
      "Please input the whole https URL, ex: https://ror.org/02catss52"),

  providerName: string().label("Provider Name")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  providerDescription: string().label("Provider description")
    .required().validatePrefixRequestWithRegistryEndpoint(),
  providerHomeUrl: string().label("Provider home URL")
    .required().trim().url()
    .matches(/^http/, "Must be a http(s) URL")
    .validatePrefixRequestWithRegistryEndpoint(),
  providerCode: string().label("Provider code")
    .notRequired().trim().validatePrefixRequestWithRegistryEndpoint(),
  providerLocation: string().label("Provider location")
    .required().trim().validatePrefixRequestWithRegistryEndpoint(),
  providerUrlPattern: string().label("Provider URL pattern")
    .required().trim()
    .matches(/^http.+\{\$id\}/,
      "Pattern must be a http(s) URL that contains the {$id} placeholder")
    .validatePrefixRequestWithRegistryEndpoint(),

  requester: object({
    email: ref('requester.email'),
    name: ref('requester.name')
  }),
  requesterEmail: string().label("Requester e-mail")
    .required().trim().email().validatePrefixRequestWithRegistryEndpoint(),
  requesterName: string().label("Requester name")
    .required().trim().validatePrefixRequestWithRegistryEndpoint()
});


export const PrefixRequestInitialValues = {
  name: "",
  description: "",
  additionalInformation: "",
  supportingReferences: "",
  requestedPrefix: "",
  sampleId: "",
  idRegexPattern: "",
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
  requesterEmail: "",
  requesterName: ""
}

export default PrefixRegistrationRequestSchema;
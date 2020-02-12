import Formatter from 'auto-format';
// import * as S from 'string';

// const getClassName = (name) => {
// 	return capitalizeFirst(S( name ).camelize().s);
// }

// const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const validationsProperties = [];

const lowerCaseFirst = (str) => str.charAt(0).toLowerCase() + str.slice(1);

const generateFormControllerMethods = (opts) => {

	
	return opts.pages.map((p, i) => {

		const pageNumber = i + 1;
		const backUrl = (pageNumber === 1) ? 'String.format("/%s/dashboard", dispCode)' : ` ${opts.journeyPrefix}PagesUtils.getUrl(dispCode, ${opts.journeyPrefix}Constants.PAGE_${pageNumber - 1}_URL)`;
		const redirectTo = (pageNumber === opts.pages.length) ? `${opts.journeyPrefix}Constants.CYA_URL` : `${opts.journeyPrefix}Constants.PAGE_${pageNumber + 1}_URL`;

		let strArr = `
		@PreAuthorize("@pharmacyAccess.hasAccess(authentication, #dispCode)")
		@GetMapping(${opts.journeyPrefix}Constants.PAGE_${pageNumber}_URL)
		public ModelAndView get${opts.journeyPrefix}Page${pageNumber}(
				@PathVariable("dispCode") String dispCode,
				@ModelAttribute("template") TemplateUtil templateUtil
		)
		{
			
			templateUtil.setTitle(${opts.journeyPrefix}Constants.PAGE_${pageNumber}_TITLE);
			breadcrumbManager.forDynamicBackLink(templateUtil, ${backUrl});
			return ${opts.journeyPrefix}PagesUtils.get${opts.journeyPrefix}Page${pageNumber}ModelAndView(new ${opts.journeyPrefix}Page${pageNumber}Form(), dispCode);
		}

		@PreAuthorize("@pharmacyAccess.hasAccess(authentication, #dispCode)")
		@PostMapping(${opts.journeyPrefix}Constants.PAGE_${pageNumber}_POST_URL)
		public ModelAndView post${opts.journeyPrefix}Page${pageNumber}(
				@PathVariable("dispCode") String dispCode,
				@ModelAttribute("template") TemplateUtil templateUtil,
				@Valid @ModelAttribute(MysPageTO.MYS_FORM_OBJECT_KEY) ${opts.journeyPrefix}Page${pageNumber}Form form,
				BindingResult bindingResult
		)
		{
			
			if(bindingResult.hasErrors())
			{
				templateUtil.setTitle(${opts.journeyPrefix}Constants.PAGE_${pageNumber}_TITLE);
				breadcrumbManager.forDynamicBackLink(templateUtil, ${backUrl});
				return ${opts.journeyPrefix}PagesUtils.get${opts.journeyPrefix}Page${pageNumber}ModelAndView(form, dispCode);
			}

			// TODO: some SERVICE CALL HERE

			return new ModelAndView(REDIRECT +  ${opts.journeyPrefix}PagesUtils.getUrl(dispCode, ${redirectTo}));
		}

		`;

		return strArr;
	}).join('\n');

}

const generateMysControllerPage = (opts) => {
	const code = `package ${opts.basePackage}.${opts.controllersPackageName};

import com.google.common.collect.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import javax.validation.Valid;
import ${opts.basePackage}.common.TemplateUtil;
import ${opts.basePackage}.common.myspages.MysPageBaseController;
import ${opts.basePackage}.common.myspages.MysPageTO;
import ${opts.basePackage}.common.myspages.to.MysCheckYourAnswersTO;
import ${opts.basePackage}.common.myspages.to.MysSuccessPageTO;
${opts.pages.map((p, i) => `import ${opts.basePackage}.form.${opts.journeyPrefix}Page${i + 1}Form;`).join('\n')}
import ${opts.basePackage}.util.${opts.journeyPrefix}Constants;
import uk.nhs.nhsbsa.prescriptions.pxreturns.util.${opts.journeyPrefix}PagesUtils;

@Controller
@RequestMapping(value = ${opts.journeyPrefix}Constants.BASE_URL)
public class ${opts.journeyPrefix}Controller extends MysPageBaseController
{

	private static final String REDIRECT = "redirect:";

	// TODO: Create a service for this class
	//@Autowired
	//${opts.journeyPrefix}Service ${lowerCaseFirst(opts.journeyPrefix)}Service;
	
	${generateFormControllerMethods(opts)}

	@GetMapping(${opts.journeyPrefix}Constants.CYA_URL)
	public ModelAndView ${opts.journeyPrefix}CheckYourAnswersPage(
			@PathVariable("dispCode") String dispCode,
			@ModelAttribute("template") TemplateUtil templateUtil
	)
	{

		templateUtil.setTitle("${opts.checkYourAnswersTitle}");
		breadcrumbManager.forDynamicBackLink(templateUtil, ${opts.journeyPrefix}PagesUtils.getUrl(dispCode,  ${opts.journeyPrefix}Constants.PAGE_${opts.pages.length}_URL));

		MysCheckYourAnswersTO to = new MysCheckYourAnswersTO();
		to.setCyaTitle("${opts.checkYourAnswersTitle}");
		to.setCyaHtmlText("${opts.checkYourAnswersText}");
		
		to.setPrimaryButtonLinkHref(${opts.journeyPrefix}PagesUtils.getUrl(dispCode, ${opts.journeyPrefix}Constants.CYA_CONTINUE_URL));
		to.setPrimaryButtonText("${opts.checkYourAnswersPrimaryButtonText}");
		to.setCyaAnswerTOS(
				//TODO: You may possibly want to build this list from service call
				Lists.newArrayList(
					${opts.pages.map((p, ii) => p.fields.map((f) => `//		new CyaAnswerTO("${f.label}", "*** SOME ANSWER FROM SERVICE ***", ${opts.journeyPrefix}PagesUtils.getUrl(dispCode, ${opts.journeyPrefix}Constants.PAGE_${ii+1}_URL), "${p.title} - ${f.label}")`).join(',\n')).join(',\n')}
				)
		);

		return ${opts.journeyPrefix}PagesUtils.get${opts.journeyPrefix}CyaModelAndView(to);
		
	}

	@GetMapping(${opts.journeyPrefix}Constants.SUCCESS_URL)
	public ModelAndView ${opts.journeyPrefix}SuccessPage(
			@PathVariable("dispCode") String dispCode,
			@ModelAttribute("template") TemplateUtil templateUtil
	)
	{

		templateUtil.setTitle("${opts.successMessage}");
		
		MysSuccessPageTO to = new MysSuccessPageTO();
		to.setTextAfterPanel("${opts.successTextAfterPanel}");
		to.setSuccessMessage("${opts.successMessage}");
		to.setAddTickIcon(true);
		to.setTitleAfterPanel("${opts.successTitleAfterPanel}");
		to.setGoBackUrl(String.format("/%s${opts.successGoBackUrl}", dispCode));

		return ${opts.journeyPrefix}PagesUtils.get${opts.journeyPrefix}SuccessModelAndView(to);
	}

}`;
	
	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}

const generateConstantClass = (opts) => {

	const printConstants = () => {
		
		let constants = `public static final String BASE_URL = "${opts.baseUrl}";`;

		for (let i = 0; i < opts.pages.length; i++) {
			const page = opts.pages[i];
			
			constants += `
		public static final String PAGE_${i + 1}_URL = "${page.url}";
		public static final String PAGE_${i + 1}_POST_URL = "${page.action}";
		public static final String PAGE_${i + 1}_TITLE = "${page.title}";
		public static final String PAGE_${i + 1}_SUB_TITLE = "${page.subTitle}";
		
			`;
		}

		constants += `public static final String CYA_URL = "${opts.checkYourAnswersUrl}";\n`;
		constants += `public static final String CYA_CONTINUE_URL = "${opts.checkYourAnswersPrimaryButtonLinkHref}";\n`;
		constants += `public static final String SUCCESS_URL = "${opts.successUrl}";\n`;
		

		return constants;

	};

	const code = `package  ${opts.basePackage}.util;
	
	public class ${opts.journeyPrefix}Constants
	{
		private ${opts.journeyPrefix}Constants()
		{
			// nothing to do here
		}
		${printConstants()}
	}
	`;

	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
};

const generateAnnotatedForms = (opts) => {
	

	const getFields = (pageIndex) => {
		let fields = '';
		
		const page = opts.pages[pageIndex];
		
		
		for (let ii = 0; ii < page.fields.length; ii++) {
			const field = page.fields[ii];

			const validations = [];
			
			if(Array.isArray(field.validations)) field.validations.forEach(v => {
				switch (v) {
				case '@NotNull':	
					validations.push(`@NotNull(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.notNull}")`)
					validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}.notNull=${field.label} is a required field`);
					break;
				case '@Email':	
					validations.push(`@Email(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.email}")`)
					validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}.email=${field.label} must be a valid email`);
					break;
				case '@NotEmpty':	
					validations.push(`@NotEmpty(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.notEmpty}")`)
					validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}.notEmpty=${field.label} is a required field`);
					break;
				case '@Pattern':	
					validations.push(`@Pattern(regexp = "", message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.pattern}")`)
					validationsProperties.push(`#TODO:\n${opts.basePackage}.${opts.formsPackageName}.${field.name}.pattern=${field.label} must be in the following format: SOME____FORMAT`);
					break;
										
				default:
					break;
				}
			});
				
			
			const mysFieldAttributes = [];
			if (field.type) mysFieldAttributes.push(`mysFormFieldType = MysFormFieldType.${field.type ? field.type.toUpperCase() : 'TEXT'}`)
			if (field.label) mysFieldAttributes.push(`label = ${field.label ? `"${field.label}"` : '"Some label"'}`)
			if (Array.isArray(field.optionIds) && field.optionIds.length > 0) mysFieldAttributes.push(`optionIds = { ${field.optionIds.map(optId => `"${optId}"`).join(', ')}}`);
			if (Array.isArray(field.optionValues) && field.optionValues.length > 0 ) mysFieldAttributes.push(`optionValues = { ${field.optionValues.map(optionVal => `"${optionVal}"`).join(', ')}}`);
			if (Array.isArray(field.dataTargets) && field.dataTargets.length > 0) mysFieldAttributes.push(`dataTargets = { ${field.dataTargets.map(dataTarget => `"${dataTarget}"`).join(', ')}}`);
			if (field.maxLength) {
				mysFieldAttributes.push(`maxLength = ${field.maxLength}`);
				validations.push(`@Size(max = ${field.maxLength}, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.maxLength}")`);

				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}.maxLength=${field.label} cannot be longer than ${field.maxLength} characters`);
			}
			if (field.min) {
				mysFieldAttributes.push(`min = ${field.min}`);
				validations.push(`@Min(value = ${field.min}, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.min}")`);

				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}.min=${field.label} cannot be lower than ${field.min}`);
			}
			if (field.max) {
				mysFieldAttributes.push(`max = ${field.max}`);
				validations.push(`@Max(value = ${field.max}, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.max}")`);

				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}.min=${field.label} cannot be higher than ${field.max}`);
			}
			if (field.radioOrCheckboxInline) mysFieldAttributes.push(`radioOrCheckboxInline = ${field.radioOrCheckboxInline ? 'true' : 'false'}`);
			if (field.displayMode) mysFieldAttributes.push(`displayMode = MysFormField.DisplayMode.${field.displayMode.toUpperCase()}`);
			if (field.htmlChunkBeforeFieldTemplateName) mysFieldAttributes.push(`htmlChunkBeforeFieldTemplateName = ${field.htmlChunkBeforeFieldTemplateName}`);
			if (field.htmlChunkBeforeFieldFragmentName) mysFieldAttributes.push(`htmlChunkBeforeFieldFragmentName = ${field.htmlChunkBeforeFieldFragmentName}`);
			
			if (field.type === 'date') {

				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}Day.null=Day is a required field`);
				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}Month.null=Month is a required field`);
				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}Year.null=Year is a required field`);

				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}Day.range=Day can only take values between 1 and 31`);
				validationsProperties.push(`${opts.basePackage}.${opts.formsPackageName}.${field.name}Month.range=Month can only take values between 1 and 12`);

				fields += `
				@MysField(
					${mysFieldAttributes.join(',\n')}
				)
				${validations.join('\n')}
				@NotNull(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}Day.null}")
				@Range(min = 1, max = 31, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}Day.range}")
				private Integer ${field.name ? `${field.name}Day` : `fieldName${ii + 1}Day`};
				
				@NotNull(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}Month.null}")
				@Range(min = 1, max = 12, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}Month.range}")
				private Integer ${field.name ? `${field.name}Month` : `fieldName${ii + 1}Month`};

				@NotNull(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}Year.null}")
				private Integer ${field.name ? `${field.name}Year` : `fieldName${ii + 1}Year`};
				
				`;
				
			} else {
				fields += `
				@MysField(
					${mysFieldAttributes.join(',\n')}
				)
				${validations.join('\n')}
				private String ${field.name ? field.name : `fieldName` +ii+1};\n\n`;
			}
			
		}
		

		return fields;
	};

	const forms = opts.pages.map((p, i) => {

		const code = `package ${opts.basePackage}.${opts.formsPackageName};

		import lombok.Data;
		import org.hibernate.validator.constraints.Email;
		import org.hibernate.validator.constraints.Length;
		import org.hibernate.validator.constraints.NotEmpty;
		import org.hibernate.validator.constraints.Range;
		import ${opts.basePackage}.common.myspages.MysField;
		import ${opts.basePackage}.common.myspages.MysFormFieldType;
		import ${opts.basePackage}.common.util.RegexConstants;
		import ${opts.basePackage}.common.myspages.MysFormField;
	
		import javax.validation.constraints.Min;
		import javax.validation.constraints.Max;
		import javax.validation.constraints.NotNull;
		import javax.validation.constraints.Pattern;
		import javax.validation.constraints.Size;
		
		@Data
		public class ${opts.journeyPrefix}Page${i+1}Form
		{
			${getFields(i)}
		}
		`;

		const javaFormatter = Formatter.createJavaFormatter('    ');
		const codeFormatted = javaFormatter.format(code).join('\n');

		console.log('validationsProperties', validationsProperties)

		return {
			formName: `${opts.journeyPrefix}Page${i+1}Form`,
			code: codeFormatted
		}
	});

	return forms;

};

const generatePageUtils = (opts) => {

	const generateStaticMethods = () => {

		return opts.pages.map((p, i) => {
			const pageNumber = i + 1;
			return `public static ModelAndView get${opts.journeyPrefix}Page${pageNumber}ModelAndView(
				${opts.journeyPrefix}Page${pageNumber}Form form, String dispCode)
			{
				MysPageTO<Object, ${opts.journeyPrefix}Page${pageNumber}Form> mysPageTO = new MysPageTO();
				mysPageTO.setPageTitle(${opts.journeyPrefix}Constants.PAGE_${pageNumber}_TITLE);
				mysPageTO.setPageSubTitle(${opts.journeyPrefix}Constants.PAGE_${pageNumber}_SUB_TITLE);
	
				MysFragmentTO mysFragmentTO = new MysFragmentTO(
						new MysFormBuilder<${opts.journeyPrefix}Page${pageNumber}Form>("${lowerCaseFirst(opts.journeyPrefix)}Page${pageNumber}Form", MysForm.MysFormMethod.POST, getUrl(dispCode, ${opts.journeyPrefix}Constants.PAGE_${pageNumber}_POST_URL))
								.withDefaultFields(${opts.journeyPrefix}Page${pageNumber}Form.class)
								.withSubmitButtonText("Next")
								.build()
				);

				mysPageTO.setFragments(Lists.newArrayList(
						mysFragmentTO
				));
	
				mysPageTO.setFormObject(form);
				return MysPageUtils.getModelAndViewForMysPage(mysPageTO);
			}`;
		});
		
	}

	const code = `package ${opts.basePackage}.util;

import com.google.common.collect.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.servlet.ModelAndView;
import ${opts.basePackage}.common.myspages.MysForm;
import ${opts.basePackage}.common.myspages.MysFormBuilder;
import ${opts.basePackage}.common.myspages.MysFragmentTO;
import ${opts.basePackage}.common.myspages.MysPageTO;
import ${opts.basePackage}.common.myspages.MysPageUtils;
import ${opts.basePackage}.common.myspages.to.MysSuccessPageTO;
import ${opts.basePackage}.common.myspages.to.MysCheckYourAnswersTO;
import ${opts.basePackage}.common.service.to.ViewAllItemsTO;
import ${opts.basePackage}.form.HepCRegistrationForm;
import ${opts.basePackage}.form.HepCRegistrationStartForm;
${opts.pages.map((p, i) => `import ${opts.basePackage}.form.${opts.journeyPrefix}Page${i+1}Form;`).join('\n')}

public class ${opts.journeyPrefix}PagesUtils
{

	public static String getUrl(String dispCode, String urlSuffixKey)
	{
		return StringUtils.replace(${opts.journeyPrefix}Constants.BASE_URL, "{dispCode}", dispCode) + urlSuffixKey;
	}


	private ${opts.journeyPrefix}PagesUtils()
	{
		//nothing to do here
	}

	${generateStaticMethods().join('\n\n')}

	public static ModelAndView get${opts.journeyPrefix}CyaModelAndView(MysCheckYourAnswersTO to)
	{
		
		return MysPageUtils.getCheckYourAnswersMysPageModelAndView("${opts.checkYourAnswersTitle}", "${opts.checkYourAnswersSubTitle}", to);
	}


	public static ModelAndView get${opts.journeyPrefix}SuccessModelAndView(MysSuccessPageTO to)
	{
		return MysPageUtils.getSuccessMysPageModelAndView(to);
	}
	

}`;
	
	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}

const generateSecurityConfigEntries = (opts) => {
	const code = `
		// ${opts.journeyPrefix}
		${opts.pages.map(p => `.antMatchers(HttpMethod.GET, "${opts.baseUrl}${p.url}").hasAnyRole(PHARMACY_ROLE, ADMIN_ROLE)
		.antMatchers(HttpMethod.POST, "${opts.baseUrl}${p.action}").hasAnyRole(PHARMACY_ROLE, ADMIN_ROLE)
		`).join('\n')}
		.antMatchers(HttpMethod.GET, "${opts.baseUrl}${opts.checkYourAnswersUrl}").hasAnyRole(PHARMACY_ROLE, ADMIN_ROLE)
		.antMatchers(HttpMethod.GET, "${opts.baseUrl}${opts.successUrl}").hasAnyRole(PHARMACY_ROLE, ADMIN_ROLE)
	`;

	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}

export default {
	generateSecurityConfigEntries,
	generateMysControllerPage,
	generateConstantClass,
	generateAnnotatedForms,
	generatePageUtils,
	validationsProperties
}
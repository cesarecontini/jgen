import Formatter from 'auto-format';
// import * as S from 'string';

// const getClassName = (name) => {
// 	return capitalizeFirst(S( name ).camelize().s);
// }

// const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const lowerCaseFirst = (str) => str.charAt(0).toLowerCase() + str.slice(1);

const generateFormControllerMethods = (opts) => {

	
	return opts.pages.map((p, i) => {

		const pageNumber = i + 1;
		const backUrl = (pageNumber === 1) ? 'String.format("/%s/dashboard", dispCode)' : `${opts.journeyPrefix}Constants.PAGE_${pageNumber - 1}_URL`;

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

			return new ModelAndView(REDIRECT + ${opts.journeyPrefix}Constants.PAGE_${pageNumber}_URL);
		}

		`;

		return strArr;
	});

}

const generateMysControllerPage = (opts) => {
	const code = `package ${opts.basePackage}.${opts.controllersPackageName};

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
${opts.pages.map((p, i) => `import ${opts.basePackage}.form.${opts.journeyPrefix}Page${i+1}Form;`).join('\n')}
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
		public static final String PAGE_${i + 1}_URL = BASE_URL + "${page.url}";
		public static final String PAGE_${i + 1}_POST_URL = BASE_URL + "${page.action}";
		public static final String PAGE_${i + 1}_TITLE = BASE_URL + BASE_URL + "${page.title}";
		public static final String PAGE_${i + 1}_SUB_TITLE = "${page.subTitle}";
		
			`;
		}

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
					validations.push(`@NotNull(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.maxLength}")`)
					break;
				case '@Email':	
					validations.push(`@Email(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.email}")`)
					break;
				case '@NotEmpty':	
					validations.push(`@NotEmpty(message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.notEmpty}")`)
					break;
				case '@Pattern':	
					validations.push(`@Pattern(regexp = "", message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.pattern}")`)
					break;
										
				default:
					break;
				}
			});
				
			
			const mysFieldAttributes = [];
			if (field.mysFormFieldType) mysFieldAttributes.push(`mysFormFieldType = MysFormFieldType.${field.type ? field.type.toUpperCase() : 'TEXT'}`)
			if (field.label) mysFieldAttributes.push(`label = ${field.label ? `"${field.label}"` : '"Some label"'}`)
			if (Array.isArray(field.optionIds) && field.optionIds.length > 0) mysFieldAttributes.push(`optionIds = { ${field.optionIds.map(optId => `"${optId}"`).join(', ')}}`);
			if (Array.isArray(field.optionValues) && field.optionValues.length > 0 ) mysFieldAttributes.push(`optionValues = { ${field.optionValues.map(optionVal => `"${optionVal}"`).join(', ')}}`);
			if (Array.isArray(field.dataTargets) && field.dataTargets.length > 0) mysFieldAttributes.push(`dataTargets = { ${field.dataTargets.map(dataTarget => `"${dataTarget}"`).join(', ')}}`);
			if (field.maxLength) {
				mysFieldAttributes.push(`maxLength = ${field.maxLength}`);
				validations.push(`@Size(max = ${field.maxLength}, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.maxLength}")`);
			}
			if (field.min) {
				mysFieldAttributes.push(`min = ${field.min}`);
				validations.push(`@Min(value = ${field.maxLength}, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.min}")`);
			}
			if (field.max) {
				mysFieldAttributes.push(`max = ${field.max}`);
				validations.push(`@Max(value = ${field.maxLength}, message = "{${opts.basePackage}.${opts.formsPackageName}.${field.name}.max}")`);
			}
			if (field.radioOrCheckboxInline) mysFieldAttributes.push(`radioOrCheckboxInline = ${field.radioOrCheckboxInline ? 'true' : 'false'}`);
			if (field.displayMode) mysFieldAttributes.push(`displayMode = MysFormField.DisplayMode.${field.displayMode.toUpperCase()}`);
			if (field.htmlChunkBeforeFieldTemplateName) mysFieldAttributes.push(`htmlChunkBeforeFieldTemplateName = ${field.htmlChunkBeforeFieldTemplateName}`);
			if (field.htmlChunkBeforeFieldFragmentName) mysFieldAttributes.push(`htmlChunkBeforeFieldFragmentName = ${field.htmlChunkBeforeFieldFragmentName}`);
			

			fields += `
				@MysField(
					${mysFieldAttributes.join(',\n')}
				)
				${validations.join('\n')}
				private String ${field.name ? field.name : `fieldName` +ii+1};\n\n`;
		}
		

		return fields;
	};

	const forms = opts.pages.map((p, i) => {

		const code = `package ${opts.basePackage}.${opts.formsPackageName};

		import lombok.Data;
		import org.hibernate.validator.constraints.Email;
		import org.hibernate.validator.constraints.Length;
		import org.hibernate.validator.constraints.NotEmpty;
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

}`;
	
	const javaFormatter = Formatter.createJavaFormatter('    ');
	return javaFormatter.format(code).join('\n');
}


export default {
	generateMysControllerPage,
	generateConstantClass,
	generateAnnotatedForms,
	generatePageUtils
}
public with sharing class CustomMetadataService {

    @AuraEnabled    
    public static List<String> fetchAvailableCustomMetadata(){
        List<String> metadataApiNames = new List<String>();

        for (Schema.SObjectType o : Schema.getGlobalDescribe().values())
        {        
            Schema.DescribeSObjectResult objResult = o.getDescribe();
            String objApiName = objResult.getName();
            if(objApiName.endsWith('__mdt')) {
                system.debug( 'Sobject: ' + objResult );                
                system.debug( 'Sobject API Name: ' + objResult.getName() );
                metadataApiNames.add(objResult.getName());
                system.debug( 'Sobject Label Name: ' + objResult.getLabel() );   
            }            
        }
        return metadataApiNames;
    }

    @AuraEnabled 
    public static CustomMetadataService.CustomMetadataDetailWrapper getDetailsOf(String metadataApiName){
        Schema.DescribeSobjectResult[] results = Schema.describeSObjects(new List<String> {metadataApiName});

        CustomMetadataService.CustomMetadataDetailWrapper metadataDetails = new CustomMetadataService.CustomMetadataDetailWrapper();
        for(Schema.DescribeSobjectResult res : results){
            metadataDetails.label = res.getLabel();
            metadataDetails.pluralLabel = res.getLabelPlural();
            
            List<CustomMetadataService.FieldDetail> fieldDetails = new List<CustomMetadataService.FieldDetail>();
            for(Schema.SObjectField field : res.fields.getMap().values()){
                CustomMetadataService.FieldDetail fieldDetail = new CustomMetadataService.FieldDetail();
                fieldDetail.fieldName = field.getDescribe().getName();
                fieldDetail.fieldLabel = field.getDescribe().getLabel();
                fieldDetail.fieldType = field.getDescribe().getType().name();
                fieldDetails.add(fieldDetail);
            }
            metadataDetails.fields = fieldDetails;
        }
        return metadataDetails;
    }

    @AuraEnabled
    public static List<sObject> getCustomMetadataRecords(String metadataApiName){
        String query = 'SELECT fields(STANDARD) FROM ' + metadataApiName + ' LIMIT 200';
        List<sObject> records = Database.query(query);
        return records;
    }

    @AuraEnabled    
    public static List<sObject> getCustomMetadataRecordsByQuery(String query){
        List<sObject> records = Database.query(query);
        return records;
    }

    public class CustomMetadataDetailWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String pluralLabel;        
        @AuraEnabled public List<CustomMetadataService.FieldDetail> fields;
    }

    public class FieldDetail {
        @AuraEnabled public String fieldName;
        @AuraEnabled public String fieldLabel;
        @AuraEnabled public String fieldType;
    }
}
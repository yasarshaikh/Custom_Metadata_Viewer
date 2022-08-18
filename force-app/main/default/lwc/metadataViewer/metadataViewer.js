import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchAvailableCustomMetadata from '@salesforce/apex/CustomMetadataService.fetchAvailableCustomMetadata';
import getDetailsOf from '@salesforce/apex/CustomMetadataService.getDetailsOf';
import getCustomMetadataRecords from '@salesforce/apex/CustomMetadataService.getCustomMetadataRecords';
import getCustomMetadataRecordsByQuery from '@salesforce/apex/CustomMetadataService.getCustomMetadataRecordsByQuery';

export default class MetadataViewer extends LightningElement {
    metadataOptions = [];
    showSpinner = true;
    selectedCustomMetadata = '';
    selectedButton = '';
    metadataDetailWrapper = {};
    queryValue = '';

    detailData = [];
    detailColumns = [
        { label: 'Field Label', fieldName: 'fieldLabel' },
        { label: 'Field Name', fieldName: 'fieldName' },        
        { label: 'Field Type', fieldName: 'fieldType' }
    ];

    data = [];
    dataColumns = [];

    get options() {
        return this.metadataOptions;
    }

    get showDetails() {
        return this.selectedButton === 'details';
    }
    
    get showRecords() {
        return this.selectedButton === 'records';
    }

    connectedCallback() {
        fetchAvailableCustomMetadata()
            .then(result => {
                console.log(result);
                //iterate over the result and prepare option array with label and value
                this.metadataOptions = result.map((item) => { return { label: item, value: item }});
                this.showSpinner = false;
            })
            .catch(error => {
                this.showSpinner = false;
                console.error(error);
            });
    }

    handleMetadataChange(event) {
        this.selectedCustomMetadata = event.detail.value;
    }

    onShowDetails(event) {
        this.selectedButton = 'details';
        this.showSpinner = true;

        getDetailsOf({ metadataApiName: this.selectedCustomMetadata })
        .then(result =>{
            console.log(result);
            this.metadataDetailWrapper = result;
            this.detailData = result.fields;
            this.showSpinner = false;
        })
        .catch(error => {
            this.showSpinner = false;
            console.error(error);
        });
        
    }

    onShowRecords(event) {
        this.selectedButton = 'records';
        this.showSpinner = true;

        getCustomMetadataRecords({ metadataApiName: this.selectedCustomMetadata })
        .then(result => {
            console.log(result);
            this.data = result;
            this.dataColumns = Object.keys(result[0]).map((item) => { return { label: item, fieldName: item }});
            this.showSpinner = false;
        })
        .catch(error =>{
            this.showSpinner = false;
            console.error(error);
        });
    }

    onQueryChange(event) {
        this.queryValue = event.target.value;
    }

    onQueryExecute(event) {
        if(!this.queryValue) {
            console.log('Invalid query');
            this.showToastEvent('Error', 'Please enter a valid query.', 'error');
            return;
        }

        this.showSpinner = true;
        getCustomMetadataRecordsByQuery({ query: this.queryValue })
        .then(result => {
            console.log(result);
            this.data = result;
            this.dataColumns = Object.keys(result[0]).map((item) => { return { label: item, fieldName: item }});
            this.showSpinner = false;
        })
        .catch(error =>{
            this.showSpinner = false;
            console.error(error);
            this.showToastEvent('Error', error.body.message, 'error');
        });
    }

    showToastEvent(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}
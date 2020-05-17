<template>
  <div class="m-2">
    <div v-show="processing">Processando...</div>
    <b-form style="width:750px" v-show="!processing">
      <b-row>
        <b-col cols="6">
          <b-form-datepicker id="example-datepicker" v-model="dateValue" :date-format-options="{ day: 'numeric', month: 'numeric',year: 'numeric'  }" :locale="'pt-Br'" class="mb-2"></b-form-datepicker>
        </b-col >
        <b-col cols="6">
          <b-form-select placeholder="project" v-model="project" :options="projects"></b-form-select>
        </b-col>
        <b-col cols="6">
          <b-form-select placeholder="assignments" v-model="assignment" :options="assignments"></b-form-select>
        </b-col>
         <b-col cols="6">
          <b-form-select placeholder="Focal point" v-model="focalPoint" :options="focalPoints"></b-form-select>
        </b-col>
      </b-row>
      <b-row class="mt-2" v-for="(entry,i) in entries" :key="i">
        <b-col cols="9">
          <b-form-textarea
            id="textarea"
            v-model="entry.description"
            placeholder="Description..."
            rows="2"
          ></b-form-textarea>
        </b-col>
        <b-col cols="1">
          <b-form-input v-model="entry.hours"></b-form-input>
        </b-col>
        <b-col cols="2">
          <div>
            <b-button size="sm" variant="danger" @click="remove(i)" style="height:37px">Remove</b-button>
          </div>
        </b-col>
      </b-row>
      <div class="mt-2">
        <b-button type="button" @click="addRow()" variant="primary">Add Entry</b-button>
        <b-button type="button" @click="publish()" variant="danger">Publish</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import axios from "axios";
import  * as moment from 'moment';
export default {
  data() {
    return {
      dateValue: null,
      entries: [],
      processing: false,
      projects: [],
      assignments: [],
      project: null,
      assignment: null,
      focalPoint: null
    };
  },
  computed: {
    formattedDate(){
      return `${this.dateValue.getDate()}\\${this.dateValue.getMonth()+1}\\${this.dateValue.getUTCFullYear()}`
    }
  },
  methods: {
    addRow() {
      this.entries.push({
        description: "",
        hours: ""
      });
      this.saveLocal(this.entries);
     
    },
    remove(i){
      this.entries.splice(i,1);
     this.saveLocal(this.entries);
    },
    saveLocal(entries){
      let info = {
        dateValue : this.dateValue,
        project: this.project,
        assignment: this.assignment,
        focalPoint: this.focalPoint
      }
      window.localStorage.setItem("timesheet-items", JSON.stringify(entries));     
      window.localStorage.setItem("timesheet-info", JSON.stringify(info));      
      //this.$forceUpdate();
    },
    getLocal(){
      let items = window.localStorage.getItem("timesheet-items");
      return items == "" ? [] : JSON.parse(items);      
    },
    getLocalInfo(){
      let items = window.localStorage.getItem("timesheet-info");
      return items == "" ? {} : JSON.parse(items);      
    },
    publish() {
      let self = this;
      
      let promises = self.entries.map((e)=>{
        return ()=>{
          let externalResolver = "";
        let promise = new Promise((resolve,reject)=>{
          externalResolver = resolve;
            let entryInfo = {
                              command: "fill-info",
                              entry: {
                                date: moment(this.dateValue).format("DD/MM/YYYY"),
                                hours: e.hours,
                                description: e.description
                              }
                            };
            chrome.tabs.sendMessage(this.tab,entryInfo,
              function(response) {
                if (response == "fill-end") {
                  self.status = response;
                }
              }
            );
            //resolveRef = resolve;
        });
        return {p:promise,r:externalResolver};
        }
      })

      let runnning = false;
     let tracker = setInterval(()=>{
       self.processing = true;
       if(promises.length == 0){
        clearInterval(tracker);
        self.processing = false;
       }
       if(runnning == false){
         runnning = true;
          let promiseSelf = promises.pop();
          let promiseResolve = promiseSelf();
          self.resolvePromise = promiseResolve.r;
          promiseResolve.p.then(()=>{
            runnning = false;
          })
       }
     },1000);
     
    }
  },
  mounted() {
    let self = this;
    this.entries = this.getLocal();
    let info = this.getLocalInfo();
    if(info != null) {
      this.project = info.project;
      this.assignment = info.assignment;
      this.focalPoint = info.focalPoint;
    }
    this.dateValue = new Date();

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      self.tab = tabs[0].id;
      //request info from page
      chrome.tabs.sendMessage(self.tab, { command: "load-info" }, function(
        response
      ) {
        self.$root.$emit("info-loaded", response);
      });
    });
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if(self.status == "fill-end"){
        if(changeInfo.status)
          if(changeInfo.status == "complete" && tab.url == "https://timetracker.bairesdev.com/ListaTimeTracker.aspx"){
            chrome.tabs.sendMessage(self.tab, { command: "redirect" });
          }
          if(changeInfo.status == "complete" && tab.url == "https://timetracker.bairesdev.com/CargaTimeTracker.aspx"){
            self.status = "";
            self.resolvePromise();
          }
      }
      console.log(changeInfo);
      console.log(tab);
    });
    //listen info from page
    self.$root.$on("info-loaded", function(info) {
      self.date = Date.parse(info.dateValue);
      self.projects = info.projects;
      self.assignments = info.assignments;
      self.focalPoints = info.focalPoints;
    });
  }
};
</script>

<style lang="scss">
@import "node_modules/bootstrap/scss/bootstrap-reboot";
@import "node_modules/bootstrap/scss/bootstrap";
@import "node_modules/bootstrap-vue/src/index.scss";
</style>

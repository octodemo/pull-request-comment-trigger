#!/usr/bin/env node

const core = require("@actions/core");
const { context, GitHub } = require("@actions/github");

async function run() {
    const trigger = core.getInput("trigger", { required: true });

    const reaction = core.getInput("reaction");
    const { GITHUB_TOKEN } = process.env;
    if (reaction && !GITHUB_TOKEN) {
        core.setFailed('If "reaction" is supplied, GITHUB_TOKEN is required');
        return;
    }

//    core.debug("Event Name: " + context.eventName);
//    core.debug("Context: " + JSON.stringify(context));

/*    const body =
        context.eventName === "issue_comment"
            ? context.payload.comment.body
            : context.payload.pull_request.body;
    core.setOutput('comment_body', body);
*/

   const body = context.payload.issue.body;

    if (
        context.eventName === "issue_comment" &&
        !context.payload.issue.pull_request
    ) {
        // not a pull-request comment, aborting
        core.setOutput("triggered", "false");
        return;
    }

    //const triggered = context.payload.issue.labels.includes(trigger);
    core.debug("Labels: " + JSON.stringify(context.payload.issue.labels));

    var triggered = false;
    for(ind = 0; ind < context.payload.issue.labels.length; ind++)
    {
        if(context.payload.issue.labels[ind].name === trigger)
        { 
            triggered = true;
            break;
        }
    }    

    core.debug("TRIGGERED: " + triggered);
    const { owner, repo } = context.repo;


    core.setOutput("triggered", triggered);

    if (!reaction) {
        return;
    }

    const client = new GitHub(GITHUB_TOKEN);
        await client.reactions.createForIssue({
            owner,
            repo,
            issue_number: context.payload.issue.number,
            content: reaction
        });
}

run().catch(err => {
    console.error(err);
    core.setFailed("Unexpected error");
});

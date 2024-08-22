import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import {Region} from "@pulumi/aws";

// Create a new Pulumi stack configuration object
const config = new pulumi.Config();

// Set up the AWS provider with the specified region.
const provider = new aws.Provider('default', {
    region: Region.SAEast1,
});

// Create a bucket to serve our static site
const bucket = new aws.s3.Bucket("site-bucket", {
    website: {
        indexDocument: "index.html",
    },
});
new aws.s3.BucketPublicAccessBlock("example", {
    bucket: bucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
});
// Create our index document from the site content in the environment
new aws.s3.BucketObject("index", {
    bucket: bucket,
    content: '<h1>push to deploy</h1>',
    key: "index.html",
    contentType: "text/html; charset=utf-8",
});

// Attach a policy so all bucket objects are readable
new aws.s3.BucketPolicy("bucket-policy", {
    bucket: bucket.id,
    policy: {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect":    "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
            ],
            "Resource": [
                pulumi.interpolate`arn:aws:s3:::${bucket.id}/*`,
            ],
        }],
    },
});

// Export the website URL
export const websiteUrl = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
